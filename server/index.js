var axios = require("axios");
require("dotenv").config();
const cors = require("cors");
const { response } = require("express");
const express = require("express");
const Sentiment = require("sentiment");
const sentiment = new Sentiment();

var options = {
  extras: {
    completed: 3,
    not: -2,
    successfully: 2,
    pending: -3,
  },
};
const app = express();
app.use(cors());
const port = 3002;

const domain = process.env.DOMAIN;

const auth = {
  username: process.env.USER_NAME,
  password: process.env.PASSWORD,
};

// Our Main Issues Object
var issuesData = [];

//Gets all issues in a particular project using the Jira Cloud REST API
async function getIssues() {
  try {
    const baseUrl = "https://" + domain + ".atlassian.net";

    const config = {
      method: "get",
      url: baseUrl + "/rest/api/2/search",
      headers: { "Content-Type": "application/json" },
      auth: auth,
    };
    const response = await axios.request(config);
    console.log(response.data.issues);
    return response.data;
  } catch (error) {
    console.log("error: ");
    console.log(error.response.data.errors);
  }
}

// issuesData = getIssues();

async function getCommentForIssue(id) {
  try {
    const baseUrl = "https://" + domain + ".atlassian.net";

    const config = {
      method: "get",
      url: baseUrl + "/rest/api/3/issue/" + id + "/comment",
      headers: { "Content-Type": "application/json" },
      auth: auth,
    };
    const response = await axios.request(config);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.log("error: ");
    // console.log(error.response.data.errors);
    console.log(error);
    // return [];
  }
}

// console.log(getCommentForIssue("ID-4"));

const getCommentsList = async (issues) => {
  let comments = [];
  const issuePromises = issues.map((issue) => getCommentForIssue(issue.key));
  Promise.all(issuePromises)
    .then((responses) =>
      responses.forEach((response) => {
        if (response.total) {
          const d = {
            id: response.comments[0].id,
            comment: response.comments[0].body.content[0].content[0].text,
            commentedBy: response.comments[0].author.displayName,
          };
          comments.push(d);
        }
      })
    )
    .then(() => {
      console.log(comments);
      return comments;
    });
  // issues.forEach(async (issue) => {
  //   console.log("ID: " + issue.key);
  //   const comment = await getCommentForIssue(issue.key);
  //   if (comment.total > 0)
  //     comments.push({
  //       id: comment.id,
  //       comment: comment.comments[0].body,
  //       commentedBy: comment.comments[0].author.displayName,
  //     });
  // });
  // return comments;
};

app.get("/comments", async (req, res) => {
  const data = await getIssues();
  // console.log(data)
  let comments = [];

  let requests = data.issues.map((issue) => getCommentForIssue(issue.key));
  Promise.all(requests)
    .then((responses) =>
      responses.forEach((response) => {
        if (response.total) {
          let len = response.total - 1;
          let cmts = [];
          response.comments.forEach((element) =>
            cmts.push(element.body.content[0].content[0].text)
          );
          // console.log("Coments:");
          // console.log(cmts.toString());

          const d = {
            id: response.comments[len].self
              .split("issue/")[1]
              .split("/comment")[0],
            comment: response.comments[len].body.content[0].content[0].text,
            commentedBy: response.comments[len].author.displayName,
            sentimentScore: sentiment.analyze(cmts.toString(), options).score,
          };
          comments.push(d);
        } else {
          // comments.push({
          //   // id: response.comments[0].id,
          //   id: null,
          //   comment: null,
          //   commentedBy: null,
          // });
        }
      })
    )
    .then(() => {
      console.log(comments);
      res.send(JSON.stringify(comments));
    });
  // data.f;
  // const commentsList = getCommentsList(data.issues);
  // Promise.resolve([commentsList]).then((response) => {
  //   console.log("Response");
  //   console.log(response[0]);
  //   res.send(response);
  // });
  // console.log(commentsList);
  // res.send(commentsList);
});

app.get("/", async (req, res) => {
  const data = await getIssues();
  res.send(data).json();
});

app.listen(port, () => {
  console.log(`JIRA API app listening on port ${port}`);
});

// console.log(getIssues());
