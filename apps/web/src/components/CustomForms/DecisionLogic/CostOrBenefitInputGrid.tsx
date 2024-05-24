import { useProjectEditingContext } from "@/context/project";
import { CostOrBenefit } from "@/types";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

type InputProps = {
  defaultValue: CostOrBenefit;
  handleOnChange: (costOrBenefit: CostOrBenefit) => void;
  handleDelete: (id: string) => void;
};

export const CostOrBenefitInput = (props: InputProps) => {
  const { defaultValue, handleOnChange, handleDelete } = props;

  // MUI FormControl can't find arbitrarily nested components, so may need to reuse FormControl here
  // https://stackoverflow.com/questions/65395896/there-are-multiple-inputbase-components-inside-a-formcontrol
  // edit: for now, just taking FormControl usage out of index. may need to reintroduce if we want better validation
  return (
    <>
      <TextField
        variant="outlined"
        defaultValue={defaultValue.name}
        onChange={(e) =>
          handleOnChange({
            ...defaultValue,
            name: e.target.value,
          })
        }
      />
      <Select
        variant="outlined"
        defaultValue={defaultValue.type}
        onChange={(e) =>
          handleOnChange({
            ...defaultValue,
            type: e.target.value as "Cost" | "Benefit", // fixme: move this to schema def
          })
        }
        sx={{
          "& fieldset": (theme) => ({ borderWidth: "2px", borderColor: "#777" }),
        }}
      >
        <MenuItem value="Cost">Cost</MenuItem>
        <MenuItem value="Benefit">Benefit</MenuItem>
      </Select>
      <Select
        variant="outlined"
        defaultValue={defaultValue.calculationManner}
        onChange={(e) =>
          handleOnChange({
            ...defaultValue,
            calculationManner: e.target.value,
          })
        }
        sx={{
          "& fieldset": (theme) => ({ borderWidth: "2px", borderColor: "#777" }),
        }}
      >
        <MenuItem value="Static default">Static default</MenuItem>
        <MenuItem value="Calculated default">Calculated default</MenuItem>
        <MenuItem value="Calculated per instance">Calculated per instance</MenuItem>
        <MenuItem value="Prediction">Prediction</MenuItem>
      </Select>
      <TextField
        variant="outlined"
        defaultValue={defaultValue.logicDescription}
        onChange={(e) =>
          handleOnChange({
            ...defaultValue,
            logicDescription: e.target.value,
          })
        }
      />
      <Button
        variant="text"
        onClick={() => handleDelete(defaultValue.id)}
        sx={{
          padding: 0,
          minWidth: "33px",
        }}
      >
        <CloseIcon color="warning" />
      </Button>
    </>
  );
};

// todo: this is a good use case for a reducer
type GridProps = {
  handleOnChange: (costOrBenefit: CostOrBenefit) => void;
  handleDelete: (id: string) => void;
  handleAdd: () => void;
  costsAndBenefits: CostOrBenefit[];
};

export const CostOrBenefitInputGrid = (props: GridProps) => {
  const { handleOnChange, handleDelete, handleAdd, costsAndBenefits } = props;

  const { isEditing } = useProjectEditingContext();

  const headers = [
    "Name",
    "Cost/Benefit",
    "Manner of Calculation",
    "Describe the logic for determining a numeric value",
    "", // empty to leave space for x icon
  ];

  if (isEditing)
    return (
      <Box
        sx={{
          display: "grid",
          columnGap: 1.5,
          rowGap: 1,
          gridTemplateColumns: "144px 99px 147px 319px 33px",
          // responsive version
          // gridTemplateColumns: "144fr 99fr 147fr 319fr 33fr"
          "& .MuiTypography-root": {
            marginBottom: -1, // can't specify different row gaps. Alt: two grids
          },
        }}
      >
        {headers.map((h) => (
          <Typography key={`input-grid-header-${h}`}>{h}</Typography>
        ))}
        {costsAndBenefits?.map((v, i) => (
          <CostOrBenefitInput
            key={`cost-or-benefit-${i}`}
            defaultValue={v}
            handleOnChange={handleOnChange}
            handleDelete={handleDelete}
          />
        ))}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            width: "50%",
          }}
        >
          Add
        </Button>
      </Box>
    );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((h) => (
              <TableCell key={`input-table-header-${h}`}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {costsAndBenefits?.map((x, i) => {
            return (
              <TableRow key={`input-table-row-${i}`}>
                <TableCell>{x.name}</TableCell>
                <TableCell>{x.type}</TableCell>
                <TableCell>{x.calculationManner}</TableCell>
                <TableCell>{x.logicDescription}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
