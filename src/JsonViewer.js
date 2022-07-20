import React from 'react';
import TextField from '@mui/material/TextField';
import Popover from '@mui/material/Popover';
import AddIcon from '@mui/icons-material/Add';
import { Typography, Divider } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';

import ListItem from '@mui/material/ListItem';

import {
  Delete,
  KeyboardArrowUpRounded,
  KeyboardArrowDownRounded,
} from '@mui/icons-material';
import PropTypes from 'prop-types';


const presetFieldNames = [
  { label: 'addressLine1' },
  { label: 'addressLine2' },
  { label: 'city' },
  { label: 'postCode' },
  { label: 'country' },
];


JsonViewer.propTypes = {
  /*
  Start object that should be displayed. Can be an useState that is used with on onChange as well
   */
  data: PropTypes.object.isRequired,
  /*
  Title that is displayed on top as a typography object
   */
  title: PropTypes.string.isRequired,
  /*
  Function that is called to receive the changes. The return argument is an ordered object
  */
  onChange: PropTypes.func.isRequired,
};

function convertOuterObjectToInternal(data) {
  let fieldNameStatus = [];
  Object.keys(data).map((fieldName) => {
    const newFieldObject = {
      label: fieldName,
      value: data[fieldName],
      checked: true,
      wasPreset: false,
    };
    fieldNameStatus.push(newFieldObject);
  });
  return fieldNameStatus;
}

export default function JsonViewer(props) {
  const [mapState, dispatch] = React.useReducer(
    reducer,
    convertOuterObjectToInternal(props.data)
  );
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [newField, setNewField] = React.useState('');

  function reducer(state, action) {
    let newState;
    if (action.type === 'change') {
      newState = changeFieldValue(state, action.id, action.value);
    } else if (action.type === 'up' || action.type === 'down') {
      newState = moveItem(state, action.type, action.id);
    } else if (action.type === 'add') {
      newState = addField(state, action.value, action.preset);
    } else if (action.type === 'flip') {
      newState = flipState(state, action.id);
    }
    return newState;
  }


  function flipState(state, id) {
    let newState = cloneMapState(state);
    newState[id].checked = !newState[id].checked;
    return newState;
  }

  function addField(state, value, preset) {
    // check if this label already exists
    if (value === '' || getAllLabelsFromState(state).includes(value)) {
      return state;
    }

    let newState = cloneMapState(state);
    newState.push({
      label: value,
      checked: true,
      preset: preset,
    });

    return newState;
  }

  function getAllLabelsFromState(state) {
    let labels = [];
    state.map(({ label }) => {
      labels.push(label);
    });
    return labels;
  }

  function cloneMapState(state) {
    let result = [];
    state.forEach((record) => {
      result.push({ ...record });
    });
    return result;
  }

  function changeFieldValue(state, idString, value) {
    const id = parseInt(idString);
    let result = [];
    for (let i = 0; i < state.length; i++) {
      if (i == id) {
        let newObject = { ...state[i] };
        newObject.value = value;
        result.push(newObject);
      } else {
        result.push({ ...state[i] });
      }
    }
    return result;
  }

  function findFirstChecked(state, begin = 0) {
    for (let i = begin; i < state.length; i++) {
      if (state[i].checked) {
        return i;
      }
    }
    return -1;
  }

  function findLastChecked(state, begin = -1) {
    if (begin === -1) {
      begin = state.length - 1;
    }
    for (let i = begin; i >= 0; i--) {
      if (state[i].checked) {
        return i;
      }
    }
    return -1;
  }

  function sendData() {
    let result = {};
    mapState.forEach((record) => {
      if (record.checked === true) {
        result[record.label] = record.value;
      }
    });
    props.onChange({ result });
  }

  React.useEffect(() => {
    sendData();
  }, [mapState]);

  function moveItem(state, direction, idString) {
    const moveId = parseInt(idString);
    const moveTo =
      direction === 'up'
        ? findLastChecked(state, moveId - 1)
        : findFirstChecked(state, moveId + 1);

    // store the moveId into the result array
    let result = Array(state.length);
    result[moveTo] = state[moveId];

    //copy the rest, skip moveId in state, and moveTo in result
    let resultInd = 0;
    state.forEach((record, index) => {
      if (resultInd == moveTo) {
        resultInd++;
      }
      if (moveId !== index) {
        result[resultInd++] = { ...record };
      }
    });
    return result;
  }

  function renderFieldNameItem(id, label, value, first, last) {
    return (
      <TextField
        id={String(id)}
        key={label}
        variant="standard"
        defaultValue={value}
        label={label}
        onBlur={(event) =>
          dispatch({
            type: 'change',
            id: event.target.id,
            value: event.target.value,
          })
        }
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  '& > :not(style)': {
                    m: 0,
                    mt: 0.5,
                    width: 5,
                    height: 5,
                  },
                }}
              >
                <IconButton
                  aria-label="move upwards"
                  size="small"
                  disabled={id === first}
                  onClick={() => {
                    dispatch({
                      type: 'up',
                      id: id,
                    });
                  }}
                >
                  <KeyboardArrowUpRounded fontSize="tiny" />
                </IconButton>

                <IconButton
                  aria-label="move downwards"
                  size="small"
                  disabled={id === last}
                  onClick={() => {
                    dispatch({
                      type: 'down',
                      id: id,
                    });
                  }}
                >
                  <KeyboardArrowDownRounded fontSize="tiny" />
                </IconButton>
              </Box>
            </InputAdornment>
          ),
        }}
      />
    );
  }

  function generateFieldNameView() {
    // find first and last checked elements for the up/down arrows
    const first = findFirstChecked(mapState);
    const last = findLastChecked(mapState);

    return mapState.map((record, index) => {
      return (
        record.checked &&
        renderFieldNameItem(index, record.label, record.value, first, last)
      );
    });
  }

  function clickAddItem(event) {
    setAnchorEl(event.currentTarget);
  }

  function closeAddItem() {
    setAnchorEl(null);
  }

  const open = Boolean(anchorEl);

  function generateTitle() {
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
        <Typography variant="h6" component="h6">
          {props.title}
        </Typography>

        <IconButton aria-label="Add entry" size="small" onClick={clickAddItem}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  function keyPress(e) {
    if (e.code === 'Enter') {
      e.preventDefault();
      addField();
    }
  }

  /* generateCheckList creates a list for all active field names, marked removed field names and preset field names that are
  neither in removed or activate field list */
  function generateCheckList() {
    let lists = {
      active: {},
      inactive: {},
      preset: {},
    };
    // collect active elements
    Object.keys(mapStatus).map((key) => {
      lists.active[key] = true;
    });

    // collect inactive elements
    Object.keys(inactive).map((key) => {
      lists.inactive[key] = false;
    });

    // collect preset, but remove elements that are already in active or inactive list
    fieldNames.forEach((element) => {
      if (
        !Object.keys(lists.active).includes(element.label) &&
        !Object.keys(lists.inactive).includes(element.label)
      ) {
        lists.preset[element.label] = false;
      }
    });
    return lists;
  }

  function renderItem(label, checked, id) {
    return (
      <ListItem key={label}>
        <ListItemText id={String(id)} primary={label} />
        <Checkbox
          edge="end"
          checked={checked}
          onClick={() =>
            dispatch({
              type: 'flip',
              id: id,
            })
          }
          tabIndex={-1}
          disableRipple
          inputProps={{ 'aria-labelledby': label }}
        />
      </ListItem>
    );
  }

  function generateCheckListItems() {
    //let lists = generateCheckList()
    return (
      <List dense={true}>
        {mapState.map((record, index) => {
          return renderItem(record.label, record.checked, index);
        })}
      </List>
    );
  }


  function generatePresetListItems() {
    let currentFieldNames = getAllLabelsFromState(mapState)

    return (
      <List dense={true}>
      {presetFieldNames.map((record) => {
        return (!currentFieldNames.includes(record.label) &&
        <ListItem key={record.label}
          button={true}
          onClick={() => 
            dispatch({
              type: "add",
              value: record.label,
              preset: true
            })}
            >
          <ListItemText id={record.label} primary={record.label} />

          </ListItem>)
  })}
      </List>)
      }
    


  function renderNewFieldTextField() {
    return (
      <TextField
        id="combo-box-demo"
        label="New Fieldname"
        sx={{ width: '25ch' }}
        variant="filled"
        onChange={(event) => setNewField(event.target.value)}
        value={newField}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="add item"
                size="small"
                onClick={() => {
                  dispatch({
                    type: 'add',
                    value: String(newField),
                    preset: false
                  });
                  setNewField('');
                }}
              >
                <AddIcon fontSize="tiny" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  }

  function getPopOver() {
    return (
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={closeAddItem}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 0, height: '50ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <Stack>
            {renderNewFieldTextField()}
            <Divider />
            {generateCheckListItems()}
            <Divider />
            {generatePresetListItems()}
          </Stack>
        </Box>
      </Popover>
    );
  }

  return (
    <div>
      <Box
        component="form"
        sx={{
          '& > :not(style)': { m: 0 },
        }}
        noValidate
        autoComplete="off"
      >
        {generateTitle()}
        {getPopOver()}

        {generateFieldNameView()}
      </Box>
    </div>
  );
}
