import express from "express";
import bodyParser from "body-parser";
import pg from "pg"

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "1234",
  port: 5432,
});

db.connect();


// function to fetch data in database
async function getItem() {
  const result = await db.query( `SELECT * FROM item`)
  return result.rows;
}

app.get("/", async (req, res) => {
  const item = await getItem()
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: item,
  });
});

app.post("/add", async (req, res) => {
  const newitem = req.body.newItem.trim();
  if (!newitem ){ 
    const item = await getItem()
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: item,
      error : `There is no item i can add, Please insert items in type section `
    });
  } else {
    try {
      await db.query("INSERT INTO item (title) VALUES($1) RETURNING *;", [
      newitem
    ]);
    res.redirect("/");
  } catch (error) {
    console.error("Error executing query", error);
    res.status(404).send("item not added");
  }

  }

});

app.post("/edit", async (req, res) => {
  const updatedItemId = req.body.updatedItemId 
  const updatedItemTitle = req.body.updatedItemTitle
  
  try {
    await db.query(`UPDATE item set title = $1 where id=$2 RETURNING * `,[updatedItemTitle, updatedItemId])
    const item = await getItem()
   
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: item,
    });

  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).send("Error deleting item");
  }

  
});


app.post("/delete", async (req, res) => {
  
  const deleteItem = req.body.deleteItemId

  try {
    await db.query(`DELETE FROM item WHERE id=$1 RETURNING * `,[deleteItem])
    const item = await getItem()
   
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: item,
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).send("Error deleting item");
  }

});
  
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
