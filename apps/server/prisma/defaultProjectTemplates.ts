import { TemplateSchema, TemplateScope } from "xylem";

type TemplateSchemaWithStringId = Omit<TemplateSchema, "id"> & {
  id: string;
};

const Act: TemplateSchemaWithStringId = {
  id: "8eadc3dd-0c3b-4427-8b71-026f1bcfe108",
  name: "Act",
  description: "Provide a prediction that directly informs a specific, tactical task",
  type: "project",
  example: '"Based on their likelihood of churning, which customers should we reach out to?"',
  active: true,
  scope: TemplateScope.Organization,
  content: {
    categories: [
      {
        description:
          "This section defines what this project will achieve. The goal is to align stakeholders before discussing data science implementation.",
        fields: [
          {
            label: "Context for the project",
            description:
              "Why are you doing this project? What problem are you solving? What's the organizational context?",
            type: "text",
          },
          {
            label: "Task or decision this project will support",
            description: "Example: Decide which customers to reach out to",
            type: "text",
          },
          {
            label: "Define a “decision instance”",
            description: "Example: A specific customer account",
            type: "text",
          },
          {
            label: "Desired task workflow after project completion",
            description:
              "Example: A list of customer accounts is generated for each account manager",
            type: "text",
          },
          {
            label: "Sketch of final product",
            description:
              "A napkin scribble will do! Even if the outcome is not visual, try to draw what will happen. The purpose of this is to make the real-world outcome concrete just in case the words are unclear.",
            type: "image",
          },
          {
            label: "Definition of done",
            description:
              "For this version, what will you deliver? What specific capabilities will be present",
            type: "text",
          },
        ],
        name: "Goals",
      },
      {
        description:
          "This section describes how 1 or more predicted values could be used to inform decision-making. The goal is to create a list of potential models to build, with a clear understanding of the impact of each.",
        fields: [
          {
            label: "Decision Logic",
            description: "",
            type: "decision-logic",
          },
        ],
        name: "Decision logic",
      },
      {
        description:
          "This section examines the resources required to build each potential model. The goal is to support methodical decision-making about which models to build now (and which to replace with a simpler approach).",
        fields: [
          {
            label: "Model(s) required",
            description:
              "Based on the predicted value(s) used in the scoring, what models are required to support this project?",
            type: "text",
          },
          {
            label: "Training data required",
            description:
              "Based on the models required to support the project and the definition of a decision instance, what training data is required?",
            type: "text",
          },
          {
            label: "Assumptions and risks",
            description: "Include tradeoffs intended to simplify or reduce cost for this version ",
            type: "text",
          },
        ],
        name: "Models & Data",
      },
    ],
  },
  contentVersion: 1,
};

const Understand: TemplateSchemaWithStringId = {
  id: "75797d4d-6f39-467e-80e0-0d9e31d3dc35",
  name: "Understand",
  active: true,
  description: "Understand a phenomenon or its causes to formulate strategies for influencing it",
  example: '"What factors cause our customers to churn?"',
  type: "project",
  content: {
    categories: [
      {
        description: "This section gathers context to allow your team to write good requirements",
        name: "Background",
        fields: [
          {
            label: "Context for the project",
            description:
              "Why are you doing this project? What problem are you solving? What's the organizational context?",
            type: "text",
          },
        ],
      },
      {
        description:
          "This section defines what this project will achieve. The goal is to align stakeholders before development work begins.",
        name: "Requirements",
        fields: [
          {
            label: "Decision this project will support",
            type: "text",
          },
          {
            label: "How the project outputs will be used",
            type: "text",
          },
          {
            label: "Sketch of final product",
            type: "image",
            description:
              "A napkin scribble will do! Even if the outcome is not visual, try to draw what will happen. The purpose of this is to make the real-world outcome concrete just in case the words are unclear.",
          },
          {
            label: "Definition of done",
            description:
              "For this version, what will you deliver? What specific capabilities will be present",
            type: "text",
          },
          {
            label: "Decision logic",
            type: "text",
          },
          {
            label: "Models required (if any)",
            type: "text",
          },
          {
            label: "Data required",
            type: "text",
          },
          {
            label: "Assumptions and risks",
            type: "text",
          },
        ],
      },
      {
        description:
          "This section ensures that present and future technical collaborators can locate project assets and dependencies",
        name: "Technical Details",
        fields: [
          {
            label: "Tags",
            type: "tags",
          },
          {
            label: "Code repo",
            type: "short-text",
          },
          {
            label: "Model inputs",
            type: "text",
          },
          {
            label: "Model outputs",
            type: "text",
          },
          {
            label: "Datasets used",
            type: "array",
            subtype: "short-text",
          },
          {
            label: "Libraries used",
            type: "array",
            subtype: "short-text",
          },
          {
            label: "Other assets",
            type: "array",
            subtype: "short-text",
          },
        ],
      },
    ],
  },
  contentVersion: 1,
};

const Enable: TemplateSchemaWithStringId = {
  id: "da3a505c-ad9c-4ffa-af9a-0aaee0cd9c07",
  name: "Enable",
  active: true,
  description: "Any work that reduces cost or increases impact for other data science projects",
  example:
    '"In order to see what\'s happening with customers, begin collecting customer account data."',
  type: "project",
  content: {
    categories: [
      {
        description: "This section gathers context to allow your team to write good requirements",
        name: "Background",
        fields: [
          {
            label: "Context for the project",
            description:
              "Why are you doing this project? What problem are you solving? What's the organizational context?",
            type: "text",
          },
        ],
      },
      {
        description:
          "This section defines what this project will achieve. The goal is to align stakeholders before development work begins.",
        name: "Requirements",
        fields: [
          {
            label: "Capability being build",
            type: "text",
          },
          {
            label: "Plan for using the capability",
            type: "text",
          },
          {
            label: "Sketch of final product",
            type: "image",
            description:
              "A napkin scribble will do! Even if the outcome is not visual, try to draw what will happen. The purpose of this is to make the real-world outcome concrete just in case the words are unclear.",
          },
          {
            label: "Definition of done",
            description:
              "For this version, what will you deliver? What specific capabilities will be present",
            type: "text",
          },
          {
            label: "Models or other engineering required",
            type: "text",
          },
          {
            label: "Assets required",
            type: "text",
          },
          {
            label: "Assumptions and risks",
            type: "text",
          },
        ],
      },
      {
        description:
          "This section ensures that present and future technical collaborators can locate project assets and dependencies",
        name: "Technical Details",
        fields: [
          {
            label: "Tags",
            type: "tags",
          },
          {
            label: "Code repo",
            type: "short-text",
          },
          {
            label: "Documentation",
            type: "short-text",
          },
          {
            label: "Assets",
            type: "array",
            subtype: "short-text",
          },
        ],
      },
    ],
  },
  contentVersion: 1,
};

export const DefaultTemplates = [Act, Understand, Enable];
