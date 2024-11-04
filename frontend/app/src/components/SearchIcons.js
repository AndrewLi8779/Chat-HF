import React, { useState } from 'react';
import { TextField, Grid, IconButton, Typography, MenuItem, Select, FormControl, InputLabel, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import * as Icons from '@mui/icons-material';

const SearchIcons = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredIcons, setFilteredIcons] = useState(Object.keys(Icons));
  const [page, setPage] = useState(1);
  const [iconsPerPage] = useState(24);
  const [sort, setSort] = useState('name');

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = Object.keys(Icons).filter((icon) =>
      icon.toLowerCase().includes(term)
    );
    setFilteredIcons(filtered);
    setPage(1); // Reset to first page on new search
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    const sorted = [...filteredIcons].sort((a, b) =>
      event.target.value === 'name'
        ? a.localeCompare(b)
        : b.localeCompare(a)
    );
    setFilteredIcons(sorted);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedIcons = filteredIcons.slice(
    (page - 1) * iconsPerPage,
    page * iconsPerPage
  );

  return (
    <div style={{ padding: 20 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for an icon..."
        value={searchTerm}
        onChange={handleSearch}
        InputProps={{
          endAdornment: (
            <IconButton>
              <SearchIcon />
            </IconButton>
          ),
        }}
      />
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sort}
          onChange={handleSortChange}
          label="Sort By"
        >
          <MenuItem value="name">Name (A-Z)</MenuItem>
          <MenuItem value="name-reverse">Name (Z-A)</MenuItem>
        </Select>
      </FormControl>
      <Typography variant="h6" style={{ margin: '20px 0' }}>
        {filteredIcons.length} Icons Found
      </Typography>
      <Grid container spacing={2}>
        {paginatedIcons.map((iconName) => {
          const IconComponent = Icons[iconName];
          return (
            <Grid item xs={2} key={iconName} style={{ textAlign: 'center' }}>
              <IconComponent style={{ fontSize: 40 }} />
              <Typography variant="caption">{iconName}</Typography>
            </Grid>
          );
        })}
      </Grid>
      <Pagination
        count={Math.ceil(filteredIcons.length / iconsPerPage)}
        page={page}
        onChange={handlePageChange}
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

export default SearchIcons;
