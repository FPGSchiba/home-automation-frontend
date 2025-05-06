import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { z, ZodRawShape } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {TextField, Box, Typography, Stack} from "@mui/material";
import cron from 'cron-validate'
import {IBackupJobCreate, IBackupJobType, IBackupJobTypeConfigurationField} from "../store/types";

export interface DynamicConfigFormProps {
    backupJobType: IBackupJobType;
    onSubmit: (values: IBackupJobCreate) => void;
}

export interface DynamicConfigFormHandle {
    submit: () => Promise<boolean>;
}

// Zod schema builder
const getZodSchema = (fields: IBackupJobTypeConfigurationField[]) => {
    const shape: ZodRawShape = {
        schedule: z
            .string()
            .min(1, { message: "Required" })
            .refine(
                (val) => cron(val).isValid(),
                { message: "Invalid CRON expression" }
            ),
        jobTypeIdentifier: z.string().min(1, { message: "Required" }),
        name: z.string().min(1, { message: "Required" }),
    };
    fields.forEach((field) => {
        if (field.type === "string") {
            shape[field.name] = z.string().min(1, { message: "Required" });
        } else if (field.type === "number") {
            shape[field.name] = z
                .preprocess(
                    (val) => (val === "" ? undefined : Number(val)),
                    z.number({ invalid_type_error: "Must be a number" })
                        .refine((val) => !isNaN(val), { message: "Required" })
                );
        }
    });
    return z.object(shape);
};

const DynamicConfigForm = forwardRef<DynamicConfigFormHandle, DynamicConfigFormProps>(
    function DynamicConfigForm({ backupJobType, onSubmit }, ref) {
        const schema = getZodSchema(backupJobType.configurationFields);

        const {
            register,
            handleSubmit,
            formState: { errors },
            setValue,
        } = useForm<Record<string, any>>({
            resolver: zodResolver(schema),
            defaultValues: {
                schedule: "",
                jobTypeIdentifier: backupJobType.identifier,
                name: "",
                ...backupJobType.configurationFields.reduce((acc, field) => {
                    acc[field.name] = "";
                    return acc;
                }, {} as Record<string, any>),
            },
        });

        // Keep identifier in the form data, but not visible
        React.useEffect(() => {
            setValue("jobTypeIdentifier", backupJobType.identifier);
        }, [backupJobType.identifier, setValue]);

        useImperativeHandle(ref, () => ({
            submit: () =>
                new Promise<boolean>((resolve) => {
                    handleSubmit(
                        (data) => {
                            // Extract static fields
                            const { name, jobTypeIdentifier, schedule, ...rest } = data;
                            // Convert number fields to numbers
                            backupJobType.configurationFields.forEach((field) => {
                                if (field.type === "number" && rest[field.name] !== undefined) {
                                    rest[field.name] = Number(rest[field.name]);
                                }
                            });
                            // Compose the IBackupJobCreate object
                            const result: IBackupJobCreate = {
                                name,
                                jobTypeIdentifier,
                                schedule,
                                configuration: rest,
                            };
                            onSubmit(result);
                            resolve(true);
                        },
                        () => {
                            resolve(false);
                        }
                    )();
                }),
        }));

        return (
            <Box component="form" sx={{ maxWidth: 400, mx: "auto" }}>
                <Typography variant="h6" gutterBottom>
                    {backupJobType.name} Configuration
                </Typography>
                <Stack spacing={2}>
                    {/* Static fields */}
                    <TextField
                        fullWidth
                        label="CRON Schedule"
                        {...register("schedule")}
                        error={!!errors.schedule}
                        helperText={errors.schedule?.message as string || " "}
                        required
                        variant="outlined"
                    />
                    <TextField
                        fullWidth
                        label="Backup Job Name"
                        {...register("name")}
                        error={!!errors.name}
                        helperText={errors.name?.message as string || " "}
                        required
                        variant="outlined"
                    />
                    {/* Dynamic fields */}
                    {backupJobType.configurationFields.map((field) => (
                        <TextField
                            key={field.name}
                            fullWidth
                            label={field.name}
                            type={field.type === "number" ? "number" : "text"}
                            {...register(field.name)}
                            error={!!errors[field.name]}
                            helperText={errors[field.name]?.message as string || field.description}
                            required
                            variant="outlined"
                        />
                    ))}
                </Stack>
            </Box>
        );
    }
);

export default DynamicConfigForm;