import { useFetcher } from "@remix-run/react";
import type { FunctionComponent } from "react";

import type { TaskRecord } from "~/mocks/task";

export const CompleteButton: FunctionComponent<{
  task: Pick<TaskRecord, "completed">;
}> = ({ task }) => {
  // useFetcher allows us to communicate with actions and loaders without causing a navigation.
  const fetcher = useFetcher();
  const completed = fetcher.formData
    ? fetcher.formData.get("completed") === "true"
    : task.completed;

  return (
    <fetcher.Form method="put">
      <button
        aria-label={completed ? "UnComplete" : "Complete"}
        name="completed"
        className="flex item-center"
        value={completed ? "false" : "true"}
      >
        <span>{completed ? "☑︎" : "□"}</span>
        <h6 className="px-1">
          {completed ? "未完了にする" : "完了済みにする"}
        </h6>
      </button>
    </fetcher.Form>
  );
};
