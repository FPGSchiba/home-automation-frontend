import * as React from 'react';
import {useEffect} from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import {useLocation, useNavigate} from "react-router-dom";
import {Avatar, Menu, MenuItem, Tooltip} from "@mui/material";
import {deepOrange} from "@mui/material/colors";
import {useUserStore} from "../store/user";
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {FrontendPermissions, hasPermission} from "../services/permissions";
import vngdLogo from '../resources/images/vanguardSemperDucimusLogo.png';

const nonHeaderLocations = ["/login", "/reset-password"];

export function Header() {
    const displayName = useUserStore((store) => store.user?.displayName);
    const permissions = useUserStore((store) => store.permissions);
    const location = useLocation();
    const navigate = useNavigate();
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [value, setValue] = React.useState('/home');

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
        navigate(newValue);
    };

    const settings = ['Profile', 'Logout'];

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = (setting: string) => {
        setAnchorElUser(null);
        switch (setting) {
            case 'Profile':
                navigate('/profile');
                break;
            case 'Logout':
                useUserStore.getState().logout();
                break;
        }
    };

    useEffect(() => {
        // Skip processing for non-header locations
        if (nonHeaderLocations.includes(location.pathname)) {
            return;
        }

        // Get the first path segment
        const pathSegment = location.pathname.split('/')[1] || 'home';

        // Define valid paths
        const validPaths = new Set([
            'home',
            'finance',
            'meal',
            'settings',
            'users',
            'backups'
        ]);

        // Set the value based on the path segment
        if (validPaths.has(pathSegment)) {
            setValue(`/${pathSegment}`);
        } else {
            // Default to home for unknown paths
            setValue('/home');
        }
    }, [location.pathname]);

    // If current location doesn't need header, return null
    if (nonHeaderLocations.includes(location.pathname)) {
        return null;
    }

    // Create tabs array based on permissions
    const getTabs = () => {
        const tabs = [
            { value: '/home', label: 'Home', permission: null }, // Home is always visible
            { value: '/backups', label: 'Backups', permission: FrontendPermissions.backupsRead },
            { value: '/finance', label: 'Finance', permission: FrontendPermissions.financeRead },
            { value: '/meal', label: 'Meals', permission: FrontendPermissions.mealRead },
            { value: '/settings', label: 'Settings', permission: FrontendPermissions.settingsRead },
            { value: '/users', label: 'Users', permission: FrontendPermissions.usersRead }
        ];

        return tabs.filter(tab =>
            tab.permission === null || hasPermission(tab.permission, permissions)
        );
    };

    return (
        <Box sx={{ flexGrow: 1 }} className={"header header-container"}>
            <AppBar position="static" className={"header header-bar"}>
                <Toolbar>
                    <img src={vngdLogo} className="header header-logo" alt="Vanguard Logo"/>
                    <Box sx={{ width: '100%' }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            indicatorColor="secondary"
                            textColor="secondary"
                            aria-label="navigation tabs"
                        >
                            {getTabs().map((tab) => (
                                <Tab
                                    key={tab.value}
                                    value={tab.value}
                                    label={tab.label}
                                />
                            ))}
                        </Tabs>
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar
                                    sx={{ bgcolor: deepOrange[400] }}
                                    alt={displayName || ""}
                                >
                                    {displayName ? displayName[0] : "NoN"}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={() => setAnchorElUser(null)}
                        >
                            {settings.map((setting) => (
                                <MenuItem
                                    key={setting}
                                    onClick={() => handleCloseUserMenu(setting)}
                                >
                                    <Typography sx={{ textAlign: 'center' }}>
                                        {setting}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
}