
import { createStyles, MantineTheme } from "@mantine/core";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useChatStore } from "@/stores/ChatStore";
import { Snippet } from "@/stores/Snippet";
import { Button, TextInput, Paper } from "@mantine/core";
const useStyles = createStyles((theme: MantineTheme) => ({
  snippetContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.gray[0],
    [`@media (min-width: ${theme.breakpoints.md})`]: {
      padding: theme.spacing.lg,
    },
  },
  snippet: {
    width: "100%",
    minHeight: "200px",
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    fontSize: theme.fontSizes.md,
    wordWrap: "break-word",
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.gray[4]}`,
    marginTop: theme.spacing.md,
  },
}));

const SnippetDisplay = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const snippetId = router.query.snippetId as string | undefined;
  const snippets = useChatStore((state) => state.snippets);
  const activeSnippet = snippets.find((snippet: Snippet) => snippet.id === snippetId);
  const [snippetContent, setSnippetContent] = useState(activeSnippet ? activeSnippet.content : "");
  const [snippetIdInput, setSnippetIdInput] = useState(snippetId ? snippetId : "");

  useEffect(() => {
    if (snippetId) {
      setSnippetIdInput(snippetId);
      const snippet = snippets.find((snippet: Snippet) => snippet.id === snippetId);
      if (snippet) {
        setSnippetContent(snippet.content);
      }
    }
  }, [snippetId, snippets]);

  const handleSave = () => {
    const snippetToSave = snippets.find((snippet: Snippet) => snippet.id === snippetIdInput);
    if (snippetToSave) {
      // Update existing snippet
      snippetToSave.content = snippetContent;
    } else {
      // Create new snippet
      const newSnippet: Snippet = {
        id: snippetIdInput,
        content: snippetContent,
      };
      snippets.push(newSnippet);
    }
  };

  return (
    <div>
      <TextInput
        value={snippetIdInput}
        onChange={(e) => setSnippetIdInput(e.target.value)}
        placeholder="Enter a snippet ID..."
        style={{ marginBottom: '10px' }}
      />
      <TextInput
        className={classes.snippet}
        value={snippetContent}
        onChange={(e) => setSnippetContent(e.target.value)}
        placeholder="Enter a snippet..."
        style={{ marginBottom: '10px' }}
      />
      <Button color="blue" onClick={handleSave}>Save</Button>
    </div>
  );
};

export default SnippetDisplay;
