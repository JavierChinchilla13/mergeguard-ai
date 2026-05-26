export type Severity = "critical" | "high" | "medium" | "low";

export interface ReviewIssue {
  id: string;
  category: "bug" | "security" | "performance" | "smell" | "suggestion";
  title: string;
  description: string;
  severity: Severity;
  file: string;
  line: number;
  codeSnippet: string;
  recommendation: string;
}

export const MOCK_REVIEW_RESULTS: ReviewIssue[] = [
  {
    id: "1",
    category: "security",
    title: "Insecure usage of dangerouslySetInnerHTML",
    description: "Detected usage of `dangerouslySetInnerHTML` with unsanitized user input. This can lead to Cross-Site Scripting (XSS) attacks.",
    severity: "critical",
    file: "components/UserProfile.tsx",
    line: 42,
    codeSnippet: `<div dangerouslySetInnerHTML={{ __html: userData.bio }} />`,
    recommendation: "Use a library like `dompurify` to sanitize the HTML or prefer using standard React children for rendering content."
  },
  {
    id: "2",
    category: "performance",
    title: "Large re-render caused by unmemoized context provider",
    description: "The context value is being recreated on every render of the parent component, causing all consumers to re-render unnecessarily.",
    severity: "medium",
    file: "context/AppContext.tsx",
    line: 15,
    codeSnippet: `<AppContext.Provider value={{ state, dispatch }}>`,
    recommendation: "Wrap the context value in `useMemo` to ensure it only changes when `state` changes."
  },
  {
    id: "3",
    category: "bug",
    title: "Potential race condition in useEffect",
    description: "An async operation in `useEffect` does not have a cleanup function to ignore the result if the component unmounts.",
    severity: "high",
    file: "hooks/useData.ts",
    line: 12,
    codeSnippet: `useEffect(() => {\n  fetchData().then(setData);\n}, [id]);`,
    recommendation: "Add a boolean flag or an `AbortController` to the cleanup function to prevent setting state on an unmounted component."
  },
  {
    id: "4",
    category: "smell",
    title: "Deeply nested ternary operators",
    description: "The code uses nested ternary operators which makes it difficult to read and maintain.",
    severity: "low",
    file: "components/Header.tsx",
    line: 8,
    codeSnippet: `const status = isLoading ? 'loading' : error ? 'error' : 'success';`,
    recommendation: "Refactor the logic into a separate function or use early returns for better readability."
  },
  {
    id: "5",
    category: "suggestion",
    title: "Use optional chaining for better safety",
    description: "Multiple checks for object properties can be simplified using optional chaining.",
    severity: "low",
    file: "utils/formatters.ts",
    line: 25,
    codeSnippet: `if (user && user.profile && user.profile.name) {`,
    recommendation: "Replace with `if (user?.profile?.name) {`."
  }
];
