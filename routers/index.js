// import RT_Documents from "./RT_Documents";
// import RT_Admin from "./RT_Admin";
// import RT_User from "./RT_User"
import RT_Note from "./RT_Note"
export default app => {
  // app.use("/doc", RT_Documents);
  // app.use("/admin", RT_Admin);
  // app.use("/user", RT_User);
  app.use("/note", RT_Note);
};
