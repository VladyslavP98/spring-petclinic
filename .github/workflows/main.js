async function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
async function main() {
  const prTitle = process.env.PR_TITLE;
  const prNumber = process.env.PR_NUMBER;
  const branch = process.env.GITHUB_HEAD_REF;
  const scannerUrl = process.env.SCANNER_URL;
  const scannerProjectId = process.env.SCANNER_PROJECT_ID;

  const title = `${prTitle} - [${prNumber}]`;

  console.log(`Title: ${title}`);
  console.log(`Branch: ${branch}`);
  console.log(`Scanner URL: ${scannerUrl}`);
  console.log(`Scanner Project ID: ${scannerProjectId}`);

  const response = await fetch(`${scannerUrl}/projects/${scannerProjectId}/prs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      branch,
    }),
  });

  let { id, status } = await response.json();
  let pr = null;
  let requestCount = 0;
  do {
    await sleep(15);
    pr = await fetch(
      `${scannerUrl}/projects/${scannerProjectId}/prs/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());

    console.log(pr);
    recognitionResults = pr.result;
    status = pr.status;
    requestCount++;
  } while (status === "Processing" && requestCount < 5);

  if (pr.status === "Failed") {
    throw new Error("PR scan failed");
  }
  console.table(recognitionResults);
}

main().catch(console.error);
