import * as React from "react";
import {Paper} from "@mui/material";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import Tab from "@mui/material/Tab";
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import {Outlet, useNavigate, useLocation} from "react-router-dom";
import {useEffect} from "react";

export default function BackupNavigation() {
    // Set initial value to '/backups' instead of '/'
    const [value, setValue] = React.useState('/backups');
    const navigate = useNavigate();
    const location = useLocation(); // Add useLocation hook

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
        navigate(newValue);
    };

    useEffect(() => {
        // Get the current path
        const currentPath = location.pathname;

        // If we're at the root of /backups, set to /backups
        if (currentPath === '/backups') {
            setValue('/backups');
            return;
        }

        // Check if the current path matches any of our tab values
        const validPaths = ['/backups/list', '/backups/jobs', '/backups/settings'];
        const matchingPath = validPaths.find(path => currentPath.startsWith(path));

        if (matchingPath) {
            setValue(matchingPath);
        } else if (currentPath.startsWith('/backups/jobs/')) {
            // Handle job-specific routes
            setValue('/backups/jobs');
        } else if (currentPath.startsWith('/backups/list/')) {
            // Handle backup-specific routes
            setValue('/backups/list');
        } else {
            // Default to dashboard if no match
            setValue('/backups');
        }
    }, [location.pathname]);

    return (
        <div className="users users-wrapper">
            <TabContext value={value}>
                <Paper className="users users-navigation users-navigation-wrapper">
                    <TabList onChange={handleChange} aria-label="backup navigation" orientation="vertical">
                        <Tab
                            className="users users-navigation users-navigation-tab"
                            icon={<DashboardIcon />}
                            iconPosition="start"
                            label="Dashboard"
                            value="/backups"
                        />
                        <Tab
                            className="users users-navigation users-navigation-tab"
                            icon={<CloudDownloadIcon />}
                            iconPosition="start"
                            label="Backups"
                            value="/backups/list"
                        />
                        <Tab
                            className="users users-navigation users-navigation-tab"
                            icon={<ManageHistoryIcon />}
                            iconPosition="start"
                            label="Backup Jobs"
                            value="/backups/jobs"
                        />
                        <Tab
                            className="users users-navigation users-navigation-tab"
                            icon={<SettingsIcon />}
                            iconPosition="start"
                            label="Settings"
                            value="/backups/settings"
                        />
                    </TabList>
                </Paper>
                <Paper className="users users-content users-content-wrapper">
                    <TabPanel value="/backups"><Outlet /></TabPanel>
                    <TabPanel value="/backups/list"><Outlet /></TabPanel>
                    <TabPanel value="/backups/jobs"><Outlet /></TabPanel>
                    <TabPanel value="/backups/settings"><Outlet /></TabPanel>
                </Paper>
            </TabContext>
        </div>
    );
}