import * as React from "react";
import Typography from "@mui/material/Typography";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {Backdrop, Box, CircularProgress, FormControl, InputLabel, MenuItem, Modal, Paper, Select} from "@mui/material";
import Button from "@mui/material/Button";
import {useBackupStore} from "../../store/backup";
import {useEffect, useRef} from "react";
import {useNotificationStore} from "../../store/notification";
import IconButton from "@mui/material/IconButton";
import ReplayIcon from '@mui/icons-material/Replay';
import {useNavigate} from "react-router-dom";
import DynamicConfigForm, { DynamicConfigFormHandle } from "../../components/DynamicBackupForm";
import {IBackupJobCreate} from "../../store/types";

const paginationModel = {page: 0, pageSize: 10};
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};


export default function BackupJobList() {
    const backupJobs = useBackupStore((state) => state.backupJobs);
    const fetchBackupJobs = useBackupStore((state) => state.fetchBackupJobs);

    const fetchBackupJobTypes = useBackupStore((state) => state.fetchBackupJobTypes);
    const jobTypes = useBackupStore((state) => state.jobTypes);

    const notify = useNotificationStore((state) => state.notify);

    const deleteBackupJobModalOpen = useBackupStore((state) => state.backupJobDeleteModalOpen);
    const backupJobDeleteId = useBackupStore((state) => state.backupJobDeleteId);
    const deleteBackupJob = useBackupStore((state) => state.deleteBackupJob);
    const setDeleteBackupJobModalOpen = useBackupStore((state) => state.setBackupJobDeleteModalOpen);

    const createBackupJobModalOpen = useBackupStore((state) => state.backupJobCreateModalOpen);
    const setCreateBackupJobModalOpen = useBackupStore((state) => state.setBackupJobCreateModalOpen);
    const createBackupJob = useBackupStore((state) => state.createBackupJob);

    const navigate = useNavigate();
    const [fetching, setFetching] = React.useState(false);
    const [fetched, setFetched] = React.useState(false);
    const [createJobType, setCreateJobType] = React.useState("");

    const formRef = useRef<DynamicConfigFormHandle>(null);

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 200,
            hideable: true,
            filterable: false,
        },
        {
            field: 'name',
            headerName: 'Name',
            width: 200,
            sortable: true,
            filterable: true,
            hideable: false,
        },
        {
            field: 'identifier',
            headerName: 'Backup Type',
            width: 120,
            sortable: true,
            filterable: true,
            hideable: true,
        },
        {
            field: 'schedule',
            headerName: 'Schedule',
            width: 120,
            sortable: true,
            hideable: true,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            filterable: false,
            hideable: false,
            sortable: false,
            disableColumnMenu: true,
            resizable: false,
            renderCell: (params) => {
                const editOnClick = () => {
                    navigate(`/backups/jobs/${params.id}`);
                }
                const deleteOnClick = () => {
                    setDeleteBackupJobModalOpen(true, params.id.toString());
                }
                return <div>
                    <Button sx={{marginRight: "20px"}} variant="contained" color="info"
                            onClick={editOnClick}>Edit</Button>
                    <Button variant="contained" color="error" onClick={deleteOnClick}>Delete</Button>
                </div>;
            },
            valueGetter: (value, row) => `${row.id}`,
        },
    ];

    const getBackupJobs = () => {
        setFetching(true);
        fetchBackupJobs().then((res) => {
            if (!res.success) {
                notify({
                    message: res.message,
                    level: "error",
                    title: "Could not fetch backup jobs",
                })
            }
        });
        setFetching(false);
        setFetched(true);
    }

    const getBackupJobTypes = () => {
        fetchBackupJobTypes().then((res) => {
            if (!res.success) {
                notify({
                    message: res.message,
                    level: "error",
                    title: "Could not fetch backup job types",
                })
            }
        })
    }

    const handleClose = () => {
        setDeleteBackupJobModalOpen(false, "");
    }

    const handleJobCreate = (data: IBackupJobCreate) => {
        createBackupJob(data).then((res) => {
            if (!res.success) {
                notify({
                    message: res.message,
                    level: "error",
                    title: "Could not create backup job",
                })
                console.log(res.errors);
            } else {
                notify({
                    message: res.message,
                    level: "success",
                    title: "Created backup job",
                })
            }
        })
    }

    useEffect(() => {
        if (backupJobs.length === 0 && !fetched) {
            getBackupJobs();
        }
        if (jobTypes.length === 0) {
            getBackupJobTypes();
        }
    })

    return (
        <>
            <div className="backup backup-job-list backup-job-list-wrapper">
                <div className="backup backup-job-list backup-job-list-header">
                    <Typography className="backup backup-job-list backup-job-list-title" variant="h4" component="h1">Backup
                        Job List</Typography>
                    {fetching ? <CircularProgress className="backup backup-job-list backup-job-list-progress"/> :
                        <div className="backup backup-job-list backup-job-list-progress"></div>}
                    <IconButton className="backup backup-job-list backup-job-list-reload" onClick={getBackupJobs}
                                disabled={fetching}>
                        <ReplayIcon/>
                    </IconButton>
                </div>
                <Paper className="users users-list users-list-table users-list-table-wrapper" elevation={2}>
                    <DataGrid
                        className="users users-list users-list-table users-list-table-grid"
                        rows={backupJobs}
                        columns={columns}
                        initialState={{pagination: {paginationModel}}}
                        pageSizeOptions={[10, 25, 50]}
                    />
                </Paper>
                <div className="backup backup-job-list backup-job-list-b-wrapper">
                    <Button variant="contained" color="info" onClick={() => {setCreateBackupJobModalOpen(true)}}><span className="backup backup-job-list backup-job-list-b-plus">+</span> Add Job</Button>
                </div>
            </div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={createBackupJobModalOpen}
                onClose={() => { setCreateBackupJobModalOpen(false)}}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Box className="backup backup-job-list backup-job-list-cmodal" sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Create Backup Job
                    </Typography>
                    <div>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Job Type</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={createJobType}
                                label="job-type"
                                onChange={(event) => {
                                    console.log(event.target.value);
                                    setCreateJobType(event.target.value);
                                }}
                            >
                                { jobTypes.map(jobType => (
                                    <MenuItem key={jobType.id} value={jobType.identifier} >{jobType.name}</MenuItem>
                                )) }
                            </Select>
                        </FormControl>
                        {
                            jobTypes.filter(jobType => jobType.identifier === createJobType).length === 1 ?
                            <DynamicConfigForm ref={formRef} backupJobType={jobTypes.filter(jobType => jobType.identifier === createJobType)[0]} onSubmit={handleJobCreate} /> : <></>
                        }
                    </div>
                    <div className="backup backup-job-list backup-job-list-cmodal-buttons">
                        <Button variant="contained" color="success" onClick={async () => {
                            const isValid = await formRef.current?.submit();
                            if (isValid) {
                                setCreateJobType("")
                                setCreateBackupJobModalOpen(false);
                            }
                        }}>Save</Button>
                        <Button variant="contained" color="error" onClick={() => {
                            setCreateBackupJobModalOpen(false);
                        }}>Cancel</Button>
                    </div>
                </Box>
            </Modal>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={deleteBackupJobModalOpen}
                onClose={handleClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Box className="backup backup-job-list backup-job-list-dmodal" sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Confirm Deletion
                    </Typography>
                    <Typography id="modal-modal-description" sx={{mt: 2}}>
                        Are you sure you want to delete this backup job?
                    </Typography>
                    <div className="backup backup-job-list backup-job-list-dmodal-buttons">
                        <Button variant="contained" color="success" onClick={() => {
                            handleClose();
                            deleteBackupJob(backupJobDeleteId).then((res) => {
                                if (res.success) {
                                    notify({
                                        message: res.message,
                                        level: "success",
                                        title: "Backup job deleted",
                                    })
                                } else {
                                    notify({
                                        message: res.message,
                                        level: "error",
                                        title: "Could not delete backup job",
                                    })
                                }
                            });
                        }}>Delete</Button>
                        <Button variant="contained" color="error" onClick={() => {
                            handleClose();
                        }}>Cancel</Button>
                    </div>
                </Box>
            </Modal>
        </>
    );
}