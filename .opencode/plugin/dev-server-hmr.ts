import type { Plugin } from "@opencode-ai/plugin";
import { Axios } from "axios";
import { z } from "zod";

const { vmOrchestrationStatusUpdateUrl } = z
  .object({
    vmOrchestrationStatusUpdateUrl: z.string(),
  })
  .parse({
    vmOrchestrationStatusUpdateUrl:
      process.env.TAYLORDB_VM_ORCHESTRATION_STATUS_UPDATE_URL,
  });

const axios = new Axios({
  baseURL: vmOrchestrationStatusUpdateUrl,
});

const updateAppStatus = async (status: "Errored" | "Active" | "Pending") => {
  await axios.put("/", {
    status,
  });
};

export const DevServerHMRPlugin: Plugin = async ({ client, $ }) => {
  return {
    event: async ({ event }) => {
      if (event.type !== "session.idle") return;

      const result = await $`pnpm build`.catch((error) => error);

      if (result.exitCode !== 0) {
        if (!client.session["tries"]) {
          client.session["tries"] = 0;
        } else {
          client.session["tries"]++;
        }

        if (client.session["tries"] > 3) {
          await updateAppStatus("Errored");

          console.log("CHANGE STATUS TO ERRORED");

          return;
        }

        await client.session.prompt({
          path: { id: event.properties.sessionID },
          body: {
            parts: [
              {
                type: "text",
                text: `While building the project, the following error occurred:\n\n${result.stderr.toString()}\n\nPlease fix the error and try again.`,
              },
            ],
          },
        });
      }

      await updateAppStatus("Active");

      console.log("CHANGE STATUS TO ACTIVE");
    },

    "chat.message": async (input, output) => {
      await updateAppStatus("Pending");

      console.log("CHANGE STATUS TO PENDING");
    },
  };
};
