import { useDecisionLogicContext } from "@/context/decisionLogic";
import { CostOrBenefit, DecisionLogicNode, DecisionLogicScoreNode, ScoringDetail } from "@/types";
import { Box, Button, Typography } from "@mui/material";
import * as React from "react";
import { v4 as uuidgen } from "uuid";
import { CostOrBenefitInputGrid } from "./CostOrBenefitInputGrid";
import { ScoringDetailDrawer } from "./ScoringDetailDrawer";
import { createCostOrBenefit } from "./graphUtils";

const MAX_SCORE_DETAIL_ITEMS_RENDERED = 4;

const EmptyCell = ({ x, y }: { x: number; y: number }) => (
  <Box
    sx={{
      gridColumnStart: x,
      gridRowStart: y,
    }}
  />
);

const ActionCell = ({ action }: { action: DecisionLogicNode }) => (
  <Box>
    <Typography
      variant="em"
      sx={{
        lineClamp: 1,
        textOverflow: "ellipsis",
      }}
    >
      {action.value}
    </Typography>
  </Box>
);

const OutcomeCell = ({ outcome, y }: { outcome: DecisionLogicNode; y: number }) => {
  // fixme: research whether there's a better way to do vertical truncation
  const copy = outcome.value.length < 17 ? outcome.value : `${outcome.value.slice(0, 14)}...`;
  return (
    <Box
      sx={{
        gridRowStart: y,
        transform: "rotate(180deg)",
        textAlign: "center",
        writingMode: "vertical-lr",
        maxHeight: "141px",
        lineClamp: 1,
        width: "21px",
      }}
    >
      <Typography variant="em">{copy}</Typography>
    </Box>
  );
};

type ScoreCellProps = {
  score: DecisionLogicScoreNode;
  handleOnClick: () => void;
  x: number;
  y: number;
  buttonCopy: string;
};

const ScoreCell = ({ score, handleOnClick, x, y, buttonCopy }: ScoreCellProps) => (
  <Box
    key={`score-cell-${score.id}`}
    sx={{
      gridColumnStart: x,
      gridRowStart: y,
      height: "141px", // todo: should inherit from grid
      borderRadius: "16px",
      background: "#EEEEEE",
      color: "#333333",
      display: "flex",
      flexDirection: "column",
      justifyContent: "left",
    }}
  >
    <Box sx={{ textAlign: "left" }}>
      <ul style={{ marginBottom: 0.25 }}>
        {score.detail?.costsAndBenefits.slice(0, MAX_SCORE_DETAIL_ITEMS_RENDERED).map((c, i) => {
          const tooManyItems =
            (score.detail?.costsAndBenefits.length || 0) > MAX_SCORE_DETAIL_ITEMS_RENDERED;
          const isCost = c.type && c.type === "Cost";

          if (!tooManyItems || i < MAX_SCORE_DETAIL_ITEMS_RENDERED - 1) {
            return <li key={`score-cell-listitem-${i}`}>{isCost ? `(${c.name})` : c.name}</li>;
          } else {
            return (
              <li key={`score-cell-listitem-${i}`}>{`and ${
                (score.detail?.costsAndBenefits?.length || 0) - MAX_SCORE_DETAIL_ITEMS_RENDERED + 1
              } more...`}</li>
            );
          }
        })}
      </ul>
    </Box>
    <Button
      variant="text"
      className="tertiary"
      onClick={handleOnClick}
      sx={{
        justifySelf: "center",
        alignSelf: "flex-end",
        marginX: "auto",
        marginTop:
          score.detail && score.detail.costsAndBenefits.length > MAX_SCORE_DETAIL_ITEMS_RENDERED
            ? 0
            : "auto",
        marginBottom: 1.5,
      }}
    >
      {buttonCopy}
    </Button>
  </Box>
);

export type DrawerScoreData = {
  scoreId?: string;
  actionValue?: string;
  outcomeValue?: string;
  scoringDetail: ScoringDetail;
};

// fixme: this mixed data thing for drawer is flawed. IIRC it's annoying because of the mounting behavior of the MUI drawer
// - maybe if each cell is instantiated with a hidden drawer and tracks its drawer state separately, that will be easier?
//   nah, because only one component can be mounted total for the main page
// - try tracking data in this component and sending setters/reducer to drawer
export const ScoringTable = () => {
  const { isEditing, decisionLogic, dispatch } = useDecisionLogicContext();

  const defaultDrawerScoreData = React.useMemo(() => {
    return {
      scoreId: undefined,
      actionValue: undefined,
      outcomeValue: undefined,
      scoringDetail: {
        probability: "",
        costsAndBenefits: [createCostOrBenefit()],
      },
    };
  }, []);

  const [drawerScoreData, setDrawerScoreData] =
    React.useState<DrawerScoreData>(defaultDrawerScoreData);
  const [openDrawer, setOpenDrawer] = React.useState<boolean>(false);

  React.useEffect(() => setOpenDrawer(drawerScoreData !== undefined), [drawerScoreData]);

  const handleScoreCellClick = (scoreNode: DecisionLogicScoreNode) => {
    setDrawerScoreData({
      scoreId: scoreNode.id,
      actionValue: scoreNode.actionId
        ? decisionLogic.actions?.find((a) => a.id === scoreNode.actionId)?.value
        : undefined,
      outcomeValue: scoreNode.outcomeId
        ? decisionLogic.outcomes?.find((o) => o.id === scoreNode.outcomeId)?.value
        : undefined,
      scoringDetail: scoreNode.detail ?? defaultDrawerScoreData.scoringDetail,
    });
  };

  const modifyDrawerScoreData = (detail: ScoringDetail) => {
    setDrawerScoreData((d) => {
      return {
        ...d,
        scoringDetail: detail,
      };
    });
  };

  const onCloseDrawer = () => {
    setDrawerScoreData(defaultDrawerScoreData);
  };

  const saveScoringDetail = () => {
    if (decisionLogic.scores && drawerScoreData.scoreId) {
      dispatch({
        type: "edit-scoringDetail",
        scoreId: drawerScoreData.scoreId,
        detail: drawerScoreData.scoringDetail,
      });
    }
    setDrawerScoreData(defaultDrawerScoreData);
  };

  const handleChangeNumericScore = (costOrBenefit: CostOrBenefit) => {
    if (decisionLogic.numericScore) {
      dispatch({
        type: "edit-numericScore",
        costOrBenefit,
      });
    }
  };

  const handleAddToNumericScore = () => dispatch({ type: "new-numericScore" });

  const handleNumericScoreDelete = (id: string) => {
    if (decisionLogic.numericScore) {
      dispatch({
        type: "delete-numericScore",
        id,
      });
    }
  };

  const Info = () => (
    <>
      <Typography variant="h2" sx={{ mt: 2, mb: 2 }}>
        Scoring
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Describe the factors that will contribute to calculating a score for each outcome
      </Typography>
    </>
  );

  if (decisionLogic.actionType === "Numeric" && decisionLogic.outcomeType === "Numeric") {
    return (
      <>
        <Info />
        <CostOrBenefitInputGrid
          costsAndBenefits={decisionLogic.numericScore}
          handleOnChange={handleChangeNumericScore}
          handleDelete={handleNumericScoreDelete}
          handleAdd={handleAddToNumericScore}
        />
      </>
    );
  }

  // Materialize the decision logic graph into a 2D array for easier table rendering
  let scoreArray: JSX.Element[][] = [];

  // scores updates in an effect listening on actions/outcomes, so give it time to update without throwing an error
  const emptyOrScoreCell = (s: DecisionLogicScoreNode | undefined, x: number, y: number) => {
    if (s) {
      return (
        <ScoreCell
          key={`score-cell-${s.id}`}
          score={s}
          handleOnClick={() => handleScoreCellClick(s)}
          x={x}
          y={y}
          buttonCopy={isEditing ? "Edit" : "Detail"}
        />
      );
    } else {
      return <EmptyCell key={`empty-cell-${uuidgen()}`} x={x} y={y} />;
    }
  };

  // dev note: CSS Grid coordinates start at (1,1)
  if (decisionLogic.actionType === "Discrete" && decisionLogic.outcomeType === "Discrete") {
    // Top row: empty cell, action, action, ...
    const topRow = [
      <EmptyCell x={1} y={1} key={"top-left-empty-cell"} />,
      ...decisionLogic.actions.map((a) => <ActionCell key={`action-cell-${a.id}`} action={a} />),
    ];
    scoreArray.push(topRow);
    // Subsequent rows: outcome, score, score, ...
    const nextRows = decisionLogic.outcomes.map((o, y) => {
      return [
        <OutcomeCell key={`outcome-cell-${o.id}`} outcome={o} y={y + 2} />,
        ...decisionLogic.actions.map((a, x) => {
          const matchedScore = decisionLogic.scores.find(
            (s) => s.outcomeId === o.id && s.actionId === a.id,
          );
          return emptyOrScoreCell(matchedScore, x + 2, y + 2);
        }),
      ];
    });
    scoreArray = scoreArray.concat(nextRows);
  } else if (decisionLogic.actionType === "Discrete" && decisionLogic.outcomeType === "Numeric") {
    // Top row: action, action, ...
    const topRow = [
      <EmptyCell key={`empty-cell-${uuidgen()}`} x={1} y={1} />,
      ...decisionLogic.actions.map((a) => <ActionCell key={`action-cell-${a.id}`} action={a} />),
    ];
    scoreArray.push(topRow);
    // Second row: score, score, ...
    const nextRow = decisionLogic.actions.map((a, x) =>
      emptyOrScoreCell(
        decisionLogic.scores.find((s) => s.actionId === a.id),
        x + 2,
        2,
      ),
    );
    scoreArray.push(nextRow);
  } else if (decisionLogic.actionType === "Numeric" && decisionLogic.outcomeType === "Discrete") {
    // All rows: outcome, score
    scoreArray = decisionLogic.outcomes.map((o, y) => [
      <OutcomeCell key={`outcome-cell-${o.id}`} outcome={o} y={y + 2} />,
      emptyOrScoreCell(
        decisionLogic.scores.find((s) => s.outcomeId === o.id),
        2,
        y + 2,
      ),
    ]);
  }

  const drawer = (
    <ScoringDetailDrawer
      open={openDrawer}
      onModify={modifyDrawerScoreData}
      drawerScoreData={drawerScoreData}
      onSave={saveScoringDetail}
      onCancel={onCloseDrawer}
    />
  );

  return (
    <>
      <Info />
      {scoreArray && scoreArray.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gap: "1em",
            // each score cell is half of the available space accounting for outcome col and gap
            gridTemplateColumns: `21px repeat(${scoreArray[0].length}, calc(50% - 21px - 1em))`,
            gridTemplateRows: `21px repeat(${scoreArray.length - 1}, 141px)`,
            overflow: "auto",
          }}
        >
          {scoreArray.flat()}
        </Box>
      )}
      {drawer}
    </>
  );
};
