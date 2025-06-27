import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';

interface SidebarMenuProps {
  onSelect: (option: string) => void;
  open: boolean;
  onClose: () => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ onSelect, open, onClose }) => (
  <Drawer anchor="left" open={open} onClose={onClose}>
    <Toolbar />
    <List sx={{ width: 250 }}>
      <ListItem button onClick={() => { onSelect('main-menu'); onClose(); }}>
        <ListItemIcon><HomeIcon /></ListItemIcon>
        <ListItemText primary="Menú principal" />
      </ListItem>
      <ListItem button onClick={() => { onSelect('version-history'); onClose(); }}>
        <ListItemIcon><HistoryIcon /></ListItemIcon>
        <ListItemText primary="Historial de versiones" />
      </ListItem>
    </List>
  </Drawer>
);

export default SidebarMenu;
