import { FormColumns } from "@/components/CustomForms/FormColumns";
import { DrawerModal } from "@/components/DrawerModal";
import { useProjectEditingContext } from "@/context/project";
import { CostOrBenefit, ScoringDetail } from "@/types";
import { Box, Button, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import * as React from "react";
import { CostOrBenefitInputGrid } from "./CostOrBenefitInputGrid";
import { DL_ReadOnlyText } from "./DL_ReadOnlyText";
import { DrawerScoreData } from "./ScoringTable";
import { createCostOrBenefit } from "./graphUtils";

export type ScoringDetailDrawerProps = {
  drawerScoreData: DrawerScoreData;
  onModify: (detail: ScoringDetail) => void;
  onSave: () => void;
  onCancel: () => void;
  open: boolean;
};

export const ScoringDetailDrawer = (props: ScoringDetailDrawerProps) => {
  const { drawerScoreData, onModify, onSave, onCancel, open } = props;

  const { scoreId, actionValue, outcomeValue, scoringDetail } = drawerScoreData;

  const { isEditing } = useProjectEditingContext();

  const changeProbability = (e: React.ChangeEvent<HTMLInputElement>) => {
    onModify({
      probability: e.target.value,
      costsAndBenefits: drawerScoreData.scoringDetail.costsAndBenefits,
    });
  };

  const addCostOrBenefit = () => {
    onModify({
      probability: scoringDetail.probability,
      costsAndBenefits: [...scoringDetail.costsAndBenefits, createCostOrBenefit()],
    });
  };

  const handleCostOrBenefitChange = (costOrBenefit: CostOrBenefit) => {
    onModify({
      probability: scoringDetail.probability,
      costsAndBenefits: scoringDetail.costsAndBenefits.map((x) =>
        x.id === costOrBenefit.id ? costOrBenefit : x,
      ),
    });
  };

  const handleCostOrBenefitDelete = (id: string) => {
    onModify({
      probability: scoringDetail.probability,
      costsAndBenefits: scoringDetail.costsAndBenefits.filter((x) => x.id !== id),
    });
  };

  const headerText = `${actionValue || "_"} → ${outcomeValue || "_"}`;

  if (scoreId === undefined) return null;

  return (
    <DrawerModal
      anchor="right"
      ModalProps={{
        keepMounted: true,
      }}
      onClose={onCancel}
      open={open}
      header={
        <Typography noWrap={true} variant="h2">
          Scoring Detail: {headerText}
        </Typography>
      }
      headerActions={
        <>
          <Button variant="outlined" onClick={onCancel}>
            <span>Cancel</span>
          </Button>
          {isEditing && (
            <Button variant="contained" onClick={onSave}>
              <span>Save</span>
            </Button>
          )}
        </>
      }
      sx={{ width: "847px" }}
    >
      <Stack spacing={2}>
        <FormColumns
          label="Probability of this outcome given this action"
          description={[
            'The places where you choose "prediction" will point to possible machine learning models that you could build.',
            'For classification problems, use a prediction in this top section. Example: "How likely is this customer to accept our offer?"',
            'For regression problems, use a prediction on a line item (below). Example: "How much would the contract be worth if this customer accepted?"',
          ]}
          inputElement={
            isEditing ? (
              <RadioGroup
                onChange={changeProbability}
                defaultValue={scoringDetail.probability}
                sx={{
                  "& .MuiRadio-root": {
                    paddingRight: "7px",
                    paddingTop: "5px",
                    paddingBottom: "5px",
                  },
                  "& .MuiRadio-root.Mui-checked": {
                    color: (theme) => theme.palette.highlight?.main,
                  },
                  "& .MuiRadio-root:hover": {
                    backgroundColor: "transparent",
                  },
                }}
              >
                {[
                  "Static default probability",
                  "Calculated default probability",
                  "Calculated per-instance probability",
                  "Predicted per-instance probability",
                ].map((t) => (
                  <FormControlLabel
                    key={`drawer-radio-${t}`}
                    value={t}
                    control={<Radio />}
                    label={t}
                  />
                ))}
              </RadioGroup>
            ) : (
              <Box>
                <DL_ReadOnlyText value={scoringDetail.probability} />
              </Box>
            )
          }
        />
        <div>
          <Typography variant="em" sx={{ mb: 1 }}>
            Costs and benefits of this outcome, given this action
          </Typography>
          <CostOrBenefitInputGrid
            costsAndBenefits={scoringDetail.costsAndBenefits}
            handleOnChange={handleCostOrBenefitChange}
            handleDelete={handleCostOrBenefitDelete}
            handleAdd={addCostOrBenefit}
          />
        </div>
      </Stack>
    </DrawerModal>
  );
};
