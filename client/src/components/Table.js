const Table = ({ comments, issueList }) => {
  return (
    <div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">ID</th>
            <th scope="col">Title</th>
            <th scope="col">Project</th>
            <th scope="col">Created By</th>
            <th scope="col">Latest Comment</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {issueList.map((element, index) => (
            <tr key={element.key}>
              <th scope="row">{index + 1}</th>
              <td>{element.key}</td>
              <td>{element.fields.summary}</td>
              <td>{element.fields.project.name}</td>
              <td>{element.fields.creator.displayName}</td>
              <td>
                {comments.map((el) =>
                  el.id === element.id ? (
                    <div>
                      {el.comment}
                      <br />
                      <em style={{ color: "gray", fontSize: "0.8rem" }}>
                        - {el.commentedBy}
                      </em>
                    </div>
                  ) : (
                    ""
                  )
                )}
              </td>
              <td>
                <span
                  style={{
                    backgroundColor:
                      element.fields.status.name === "To Do"
                        ? "#B9B4C7"
                        : element.fields.status.name === "In Progress"
                        ? "#FFC436"
                        : "#A8DF8E",
                    borderRadius: "10px",
                    padding: "5px",
                  }}
                >
                  {element.fields.status.name}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
