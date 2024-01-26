import {
  Form,
  Link,
  json,
  useActionData,
  useFetcher,
  useLoaderData,
  useSubmit,
} from "@remix-run/react";

import { getTask, updateTweet, updateTask } from "~/mocks/task";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { CompleteButton } from "~/components/CompleteButton";
import { useState } from "react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.taskId, "Missing taskId param");
  const task = await getTask(params.taskId);
  if (!task) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ task });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.taskId, "Missing taskId param");
  const formData = await request.formData();

  switch (request.method) {
    case "POST": {
      // tweetの更新
      const tweet = formData.get("tweet");
      invariant(tweet, "Missing tweet param");
      invariant(typeof tweet === "string", "tweet must be a string");
      return updateTweet(params.taskId, tweet);
    }

    case "PUT": {
      // 完了状態の更新
      return updateTask(params.taskId, {
        completed: formData.get("completed") === "true",
      });
    }
    default:
      return json("許可されていないメソッドです");
  }
};

export default function Contact() {
  const { task } = useLoaderData<typeof loader>();
  const error = useActionData<typeof action>();
  const fetcher = useFetcher<typeof action>();

  const tweets = fetcher.formData
    ? [fetcher.formData.get("tweet") as string, ...(task.tweets ?? [])]
    : task.tweets;

  const [inputValue, setInputValue] = useState<string>("");
  const submit = useSubmit();
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    const form = event.currentTarget.form;
    submit(form, { method: "POST" });
    setInputValue("");
  };

  const handleDestroy: React.FormEventHandler<HTMLFormElement> = (event) => {
    const response = confirm("このレコードを削除してもよろしいですか");
    if (!response) {
      event.preventDefault();
    }
  };

  return (
    <div className="px-4">
      {/* to="task" とすると相対パスになる(現在のパス + /task になってしまう) */}
      <Link to="/task" className="text-sm underline">
        {"<"} タスク一覧
      </Link>

      <div id="card" className="py-2">
        <h1 className="font-bold text-2xl my-2">{task.title}</h1>
        {task.description ? (
          <h4 className="text-md my-2">{task.description}</h4>
        ) : (
          <i>説明がありません</i>
        )}
      </div>

      <div className="my-6">
        <h4 className="text-sm">つぶやき</h4>
        {!tweets || tweets.length === 0 ? (
          <i className="text-xs">まだつぶやきはありません</i>
        ) : (
          tweets.map((tweet, index) => {
            return (
              <div id="card" key={index} className="w-1/2">
                <p>{tweet}</p>
              </div>
            );
          })
        )}
        <div className="my-4">
          <div className="flex item-center">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control*/}
            <label>つぶやきを追加する: </label>
            {error ? (
              <em className="text-red-600">{error.toString()}</em>
            ) : null}
          </div>
          <fetcher.Form
            method="post"
            className="mt-1 flex w-1/2"
            onSubmit={handleSubmit}
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              aria-label="tweet"
              name="tweet"
              className="flex-1"
              placeholder="ツイート"
            />
            <button type="submit">追加</button>
          </fetcher.Form>
        </div>
      </div>

      <div id="bottom" className="flex items-center flex-1">
        <CompleteButton task={task} />
        <div className="py-2 flex items-center flex-1 justify-end">
          <Form
            /* <Form /> での actionは <Link /> の to 的な感じ */
            action="edit"
            className="mr-2"
          >
            <button type="submit">編集する</button>
          </Form>

          <Form action="destroy" method="post" onSubmit={handleDestroy}>
            <button type="submit">削除する</button>
          </Form>
        </div>
      </div>
    </div>
  );
}
