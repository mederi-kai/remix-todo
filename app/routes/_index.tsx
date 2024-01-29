import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import {
  /* Components */
  Link,
  /* Route Module */
  json,
  /* Hooks */
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { sleep } from "~/libs/util";
import { getTasks } from "~/mocks/task";

// GET処理
export const loader = async ({ params }: LoaderFunctionArgs) => {
  // dynamic route params
  console.log(params);
  const tasks = await getTasks();
  return json({ tasks });
};

// POST処理
export const action = async ({ request }: ActionFunctionArgs) => {
  await sleep(1000);
  // RESTfull 的な処理も可能
  switch (request.method) {
    case "POST":
      return json("POSTメソッドが実行されました");
    case "PUT":
      return json("PUTメソッドが実行されました");
    case "DELETE":
      return json("DELETEメソッドが実行されました");
    default:
      return json("許可されていないメソッドです");
  }
};

export default function Index() {
  const { tasks } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>(); // ページ遷移なしでフォーム送信を実装する
  const formMethod = fetcher.formMethod;
  const message = fetcher.data;

  return (
    <div>
      <h4 className="mx-2 bold">loader Demo :</h4>
      <div className="flex">
        {tasks.map((task) => {
          return (
            <Link key={task.id} to={`/task/${task.id}`} className="mx-1">
              <div id="card">
                <h4>{task.title ?? "タイトルなし"}</h4>
                <h5 className="text-xs my-1">{task.description}</h5>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="my-6">
        <h4 className="mx-2 bold">
          action Demo : <span className="text-xs">{message}</span>
        </h4>
        <div className="flex">
          {["POST", "PUT", "DELETE", "PATCH"].map((method) => {
            return (
              <fetcher.Form
                key={method}
                method={method as "POST" | "PUT" | "DELETE" | "PATCH"}
                className="m-2"
              >
                <button type="submit">
                  {formMethod === method ? <div id="spinner" /> : method}
                </button>
              </fetcher.Form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
