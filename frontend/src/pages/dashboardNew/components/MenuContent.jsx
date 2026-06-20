import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Collapse from '@mui/material/Collapse';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DepartmentsIcon from '@mui/icons-material/ApartmentRounded';
import MembersIcon from '@mui/icons-material/PeopleRounded';
import ProjectsIcon from '@mui/icons-material/FolderOpenRounded';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, path: '/dashboard' },
  { text: 'Analytics', icon: <AnalyticsRoundedIcon />, path: '#' },
  { text: 'Tasks', icon: <AssignmentRoundedIcon />, path: '#' },
];

const organizationSubItems = [
  { text: 'Departments', icon: <DepartmentsIcon />, path: '/organization/departments' },
  { text: 'Members', icon: <MembersIcon />, path: '/organization/members' },
  { text: 'Projects', icon: <ProjectsIcon />, path: '/organization/projects' },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, path: '#' },
  { text: 'About', icon: <InfoRoundedIcon />, path: '#' },
  { text: 'Feedback', icon: <HelpRoundedIcon />, path: '#' },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orgOpen, setOrgOpen] = useState(false);

  const handleNavigation = (path) => {
    if (path !== '#') {
      navigate(path);
    }
  };

  const isOrgRoute = location.pathname.startsWith('/organization');

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Organization with TreeView-like Collapse */}
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => setOrgOpen(!orgOpen)}
            selected={isOrgRoute}
          >
            <ListItemIcon><BusinessRoundedIcon /></ListItemIcon>
            <ListItemText primary="Organization" />
            {orgOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={orgOpen} timeout="auto" unmountOnExit>
            <Stack component="div" sx={{ pl: 1 }}>
              {organizationSubItems.map((item, index) => (
                <ListItemButton
                  key={index}
                  sx={{ pl: 4 }}
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              ))}
            </Stack>
          </Collapse>
        </ListItem>
      </List>

      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={() => handleNavigation(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
