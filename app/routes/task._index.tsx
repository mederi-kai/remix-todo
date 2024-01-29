import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import { Form, Link, json, redirect, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import SearchForm from "~/components/SearchForm";
import { createTask, getTasks } from "~/mocks/task";

export const meta: MetaFunction = () => {
  return [{ name: "title", content: "タスク一覧" }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const tasks = await getTasks(q);
  return json({ tasks, q });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const title = formData.get("title");
  if (!title) {
    return json({ error: "タイトルを入力してください" }, { status: 400 });
  }
  invariant(typeof title === "string", "title must be a string");
  const newTask = await createTask({
    title,
    description: "",
    completed: false,
    tweets: [],
  });
  return redirect(`/task/${newTask.id}/edit`);
};

export default function Task() {
  const { q, tasks } = useLoaderData<typeof loader>();

  const tabContents = [
    { name: "未完了のタスク", tasks: tasks.filter((t) => !t.completed) },
    { name: "完了済みのタスク", tasks: tasks.filter((t) => t.completed) },
  ];

  return (
    <>
      <div>
        <div className="w-full mx-2 mb-10">
          <SearchForm q={q} />
        </div>
        <div className="flex-1">
          <div className="flex">
            {tabContents.map((tab, index) => {
              return (
                <div key={index} className="flex-1 mx-2">
                  <p>{tab.name}</p>
                  {tab.tasks.length === 0 ? (
                    <div className="my-2">
                      <i className="text-sm">見つかりませんでした</i>
                    </div>
                  ) : (
                    tab.tasks.map((task) => {
                      return (
                        <Link key={task.id} to={task.id}>
                          <div id="card">
                            {task.completed ? (
                              <div className="flex items-center">
                                <span>☑︎</span>
                                <h6 className="text-xs mx-1">完了済み</h6>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <span>□</span>
                                <h6 className="text-xs mx-1">未完了</h6>
                              </div>
                            )}

                            <h2>{task.title}</h2>
                            <h2>{task.description}</h2>
                            <p>作成日時: {task.createdAt ?? "-"}</p>
                            {task.updatedAt && (
                              <p>更新日時: {task.updatedAt}</p>
                            )}
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div id="bottom">
        <Form method="post" className="py-2">
          <input
            type="text"
            name="title"
            placeholder="新規タスクを入力"
            required
          />
          <button type="submit" className="mx-2">
            新規作成
          </button>
        </Form>
      </div>
    </>
  );
}
