import { Form, useNavigation, useSubmit } from "@remix-run/react";

import { useEffect } from "react";

export default function SearchForm({ q }: { q: string | null }) {
  const navigation = useNavigation();
  const submit = useSubmit();

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);
  return (
    <div>
      {/*eslint-disable-next-line jsx-a11y/label-has-associated-control*/}
      <label>検索する</label>
      <Form
        id="search-form"
        role="search"
        onChange={(event) => {
          const isFirstSearch = q === null;
          // history stack
          submit(event.currentTarget, {
            replace: !isFirstSearch,
          });
        }}
      >
        <input
          id="q"
          className={searching ? "spinner" : ""}
          defaultValue={q || ""}
          placeholder="検索したいキーワード"
          type="search"
          name="q"
        />
        <div id="search-spinner" aria-hidden hidden={true} />
      </Form>
    </div>
  );
}
