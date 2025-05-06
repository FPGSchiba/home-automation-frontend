/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance } from "axios";
import https from 'https';
import {IBackupJob, IBackupJobCreate, IBackupJobType, IErrorDetail, IUserInfo} from "../store/types";
import {Permission} from "../store/user";
import {getFrontendConfig} from "./util";

export enum ApiStatus {
    SUCCESS = 'success',
    ERROR = 'error',
}

class AutomationAPI {
    protected static userEndpoint: AxiosInstance;
    protected static authEndpoint: AxiosInstance;
    protected static mealEndpoint: AxiosInstance;
    protected static financeEndpoint: AxiosInstance;
    protected static backupEndpoint: AxiosInstance;
    private token: string;
    private static instance: AutomationAPI;

    static getInstance(): AutomationAPI {
        if (!AutomationAPI.instance) {
            AutomationAPI.instance = new AutomationAPI().init();
        }
        return AutomationAPI.instance;
    }

    private createAxiosInstance(baseURL: string): AxiosInstance {
        const httpsAgent = new https.Agent({
            rejectUnauthorized: false,
        });

        const instance = axios.create({
            baseURL,
            httpsAgent,
        });

        // If token exists, set it for the new instance
        if (this.token) {
            instance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        }

        return instance;
    }

    private initializeEndpoints(): void {
        const config = getFrontendConfig();
        const apiPath = config["api-path"];
        const authPath = config["auth-path"];
        const userApiHost = config["user-api-host"];
        const mealApiHost = config["meal-api-host"];
        const financeApiHost = config["finance-api-host"];
        const backupApiHost = config["backup-api-host"];

        AutomationAPI.userEndpoint = this.createAxiosInstance(userApiHost + apiPath);
        AutomationAPI.authEndpoint = this.createAxiosInstance(userApiHost + authPath);
        AutomationAPI.mealEndpoint = this.createAxiosInstance(mealApiHost + apiPath);
        AutomationAPI.financeEndpoint = this.createAxiosInstance(financeApiHost + apiPath);
        AutomationAPI.backupEndpoint = this.createAxiosInstance(backupApiHost + apiPath);
    }

    public init(): this {
        this.initializeEndpoints();
        return this;
    }

    // New method to reload endpoints
    public reloadEndpoints(): void {
        this.initializeEndpoints();
    }

    // Modified to ensure endpoints are fresh
    private ensureEndpoints(): void {
        if (!AutomationAPI.userEndpoint ||
            !AutomationAPI.authEndpoint ||
            !AutomationAPI.mealEndpoint ||
            !AutomationAPI.financeEndpoint ||
            !AutomationAPI.backupEndpoint) {
            this.reloadEndpoints();
        }
    }

    public setToken(token: string): void {
        this.token = token;
        // Update token for all endpoints
        [
            AutomationAPI.authEndpoint,
            AutomationAPI.userEndpoint,
            AutomationAPI.mealEndpoint,
            AutomationAPI.financeEndpoint,
            AutomationAPI.backupEndpoint
        ].forEach(endpoint => {
            if (endpoint) {
                endpoint.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            }
        });
    }

    // Modified API methods to ensure fresh endpoints
    public async login(email: string, password: string): Promise<{ message: string, status: ApiStatus, token?: string, user?: IUserInfo }> {
        this.ensureEndpoints();
        try {
            const response = await AutomationAPI.authEndpoint.post('/login', {
                email,
                password,
            });
            return response.data;
        }
        catch (reason) {
            return {message: reason.response?.data?.message || reason.message, status: ApiStatus.ERROR};
        }
    }

    public async listPermissions(): Promise<{ message: string, status: ApiStatus, permissions?: Permission[] }> {
        this.ensureEndpoints();
        try {
            const response = await AutomationAPI.userEndpoint.get('/permissions/');
            return response.data;
        }
        catch (reason) {
            return {message: reason.response?.data?.message || reason.message, status: ApiStatus.ERROR};
        }
    }

    public async getFinanceVersion(): Promise<{ message: string, status: ApiStatus, version?: string }> {
        this.ensureEndpoints();
        try {
            const response = await AutomationAPI.financeEndpoint.get('/');
            return response.data;
        }
        catch (reason) {
            return {message: reason.response?.data?.message || reason.message, status: ApiStatus.ERROR};
        }
    }

    public async getBackupJobTypes(): Promise<{ message: string, status: ApiStatus, jobTypes?: IBackupJobType[] }> {
        this.ensureEndpoints();
        try {
            const response = await AutomationAPI.backupEndpoint.get('/job-types');
            return response.data;
        } catch (reason) {
            return { message: reason.response?.data?.message || reason.message, status: ApiStatus.ERROR};
        }
    }

    public async getBackupJobs(): Promise<{ message: string, status: ApiStatus, jobs?: IBackupJob[] }> {
        this.ensureEndpoints();
        try {
            const response = await AutomationAPI.backupEndpoint.get('/jobs/');
            return response.data;
        } catch (reason) {
            return {message: reason.response?.data?.message || reason.message, status: ApiStatus.ERROR};
        }
    }

    public async deleteBackupJob(id: string): Promise<{ message: string, status: ApiStatus }> {
        this.ensureEndpoints();
        try {
            const response = await AutomationAPI.backupEndpoint.delete(`/jobs/${id}`);
            return response.data;
        } catch (reason) {
            return {message: reason.response?.data?.message || reason.message, status: ApiStatus.ERROR};
        }
    }

    public async createBackupJob(job: IBackupJobCreate): Promise<{ message: string, status: ApiStatus, job?: IBackupJob, errors?: IErrorDetail[] }> {
        this.ensureEndpoints();
        try {
            const response = await AutomationAPI.backupEndpoint.post('/jobs/', job);
            return response.data;
        } catch (reason) {
            return {
                message: reason.response?.data?.message || reason.message,
                status: ApiStatus.ERROR,
                errors: reason.response?.data?.errors
            };
        }
    }
}

export default AutomationAPI.getInstance();