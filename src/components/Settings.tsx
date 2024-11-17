import styled from "@emotion/styled";
import { observer } from "mobx-react-lite";
import React, { FormEvent, useRef, useState } from "react";
import { Core } from "../state/core";
import { LargeButton } from "./design/Button";
import { Center } from "./design/Center";
import { Header } from "./design/Header";
import { Link } from "./design/Link";
import { Paragraph } from "./design/Paragraph";
import { Row } from "./design/Row";

const UserLogin = styled.span`
  color: #000;
`;

const TokenInput = styled.input`
  flex-grow: 1;
  padding: 4px 8px;
  margin-right: 8px;

  &:focus {
    outline-color: #2ee59d;
  }
`;

export interface SettingsProps {
  core: Core;
}

export const Settings = observer((props: SettingsProps) => {
  const [state, setState] = useState<{
    editing: boolean | "default";
  }>({
    editing: "default",
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const inputRefBitBucket = useRef<HTMLInputElement>(null);

  // Show the token editing form if:
  // - editing is "default" (user has not said whether they want to open or dismiss the form)
  //   AND the token is not set; or
  // - editing is explicitly set to true (user opened the form).
  const editing =
    state.editing === "default" ? !props.core.token : state.editing;

  const openForm = () => {
    setState({
      editing: true,
    });
  };

  const saveForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputRef.current && !inputRefBitBucket.current) {
      return;
    }
    const github_token = inputRef?.current?.value;
    const bitbucket_token = inputRefBitBucket?.current?.value;
    if (github_token) {
      props.core
          .setNewToken(github_token)
          .then(() => console.log("GitHub API token updated."));
    }
    if (bitbucket_token) {
      props.core
      .setNewTokenBB(bitbucket_token)
      .then(() => console.log("BitBucket API token updated."));
    }

    setState({
      editing: false,
    });
  };

  const cancelForm = () => {
    setState({
      editing: false,
    });
  };

  return (
    <>
      <Header>Settings</Header>
      {!editing ? (
        props.core.loadedState ? (
          <Row>
            <Paragraph>
              Signed in as{" "}
              <UserLogin>
                {props.core.loadedState.userLogin || "unknown"}
              </UserLogin>
              .
            </Paragraph>
            <LargeButton onClick={openForm}>Update token</LargeButton>
          </Row>
        ) : props.core.lastError ? (
          <Row>
            <Paragraph>Is your token valid?</Paragraph>
            <LargeButton onClick={openForm}>Update token</LargeButton>
          </Row>
        ) : props.core.token ? (
          <Row>
            <Paragraph>
              We're loading your pull requests. This could take a while...
            </Paragraph>
            <LargeButton onClick={openForm}>Update token</LargeButton>
          </Row>
        ) : (
          <>
            <Paragraph>
              Welcome to PR Monitor! In order to use this Chrome extension, you
              need to provide a GitHub API token. This will be used to load your
              pull requests.
            </Paragraph>
            <Center>
              <LargeButton onClick={openForm}>Update token</LargeButton>
            </Center>
          </>
        )
      ) : (
        <form onSubmit={saveForm}>
          {!props.core.token && (
            <Paragraph>
              Welcome to PR Monitor! In order to use this Chrome extension, you
              need to provide a GitHub API token. This will be used to load your
              pull requests.
            </Paragraph>
          )}
          <Paragraph>
            Enter a GitHub API token with <b>repo</b> scope (
            <Link
              href="https://github.com/settings/tokens/new?description=PR%20Monitor&amp;scopes=repo"
              target="_blank"
            >
              create a new one
            </Link>
            ):
          </Paragraph>
          <Row>
            <TokenInput ref={inputRef} />
          </Row>
          <Paragraph>
            Enter a Bitbucket API token with <b>repo</b> scope (
            <Link
                href="https://github.com/settings/tokens/new?description=PR%20Monitor&amp;scopes=repo"
                target="_blank"
            >
              create a new one
            </Link>
            ):
          </Paragraph>
          <Row>
            <TokenInput ref={inputRefBitBucket} />
            <LargeButton type="submit">Save</LargeButton>
            <LargeButton onClick={cancelForm}>Cancel</LargeButton>
          </Row>
        </form>
      )}
    </>
  );
});
