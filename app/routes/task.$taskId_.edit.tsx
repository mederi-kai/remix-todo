import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { getTask, updateTask } from "~/mocks/task";

// ※ task.$taskId_.edit.tsx とすることで、親コンポーネントの task.$taskId.tsx のレイアウトは引き継がれない
// ※ task.$taskId.edit.tsx とすると、親コンポーネントの task.$taskId.tsx のレイアウトは引き継がれる

export const loader = async ({ params }: LoaderFunctionArgs) => {
  // validating params
  invariant(params.taskId, "Missing taskId param");
  const task = await getTask(params.taskId);
  if (!task) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ task });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  // validating params
  invariant(params.taskId, "Missing taskId param");
  const formData = await request.formData();

  // const updates = Object.fromEntries(formData);
  const title = formData.get("title");
  const description = formData.get("description");

  const errors = {
    title: title ? null : "Title is required",
    description: description ? null : "Description is required",
  };

  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);

  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof description === "string", "slug must be a string");

  await updateTask(params.taskId, { title, description });
  return redirect(`/task/${params.taskId}`);
};

export default function EditTask() {
  const { task } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  const navigate = useNavigate();
  return (
    <div className="px-4">
      <Form id="task-form" method="post">
        <div className="my-2">
          <div className="flex item-center">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control*/}
            <label>タイトル: </label>
            {errors?.title ? (
              <em className="text-red-600">{errors.title}</em>
            ) : null}
          </div>
          <input
            defaultValue={task.title}
            aria-label="title"
            name="title" // formData
            type="text"
            placeholder="title"
          />
        </div>
        <div className="my-2">
          <div className="flex item-center">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control*/}
            <label>概要: </label>
            {errors?.description ? (
              <em className="text-red-600">{errors.description}</em>
            ) : null}
          </div>
          <textarea
            defaultValue={task.description}
            aria-label="description"
            name="description"
            placeholder="タスクの概要を入力してください"
            className="w-full"
          />
        </div>
        <div>
          <button type="submit" className="mr-2">
            保存
          </button>
          <button onClick={() => navigate(-1)} type="button">
            キャンセル
          </button>
        </div>
      </Form>
    </div>
  );
}
