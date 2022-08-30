const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.ejs");
const mongoose = require("mongoose");
const lodash = require("lodash");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
var items = ["Buy Food", "Cook Food", "Eat Food"];
let workItems = [];
app.use(express.static("public"));
mongoose.connect("mongodb+srv://suraj:YQjz3ZiIjpm3pMDa@cluster0.2arfvmr.mongodb.net/todolistDB");
const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item(
    {
        name: "Welcome To Your TodoList"
    }
);
const item2 = new Item(
    {
        name: "Hit the + button to add a New Item"
    }
);
const item3 = new Item(
    {
        name: "Hit the checkbox to delete an Item"
    }
);
const defaultItems = [item1, item2, item3];
const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("List", listSchema);
app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length == 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err)
                    console.log(err);
                else
                    console.log("Successfully Inserted to todolistDB");
            });
        }
        res.render("list.ejs", { listTitle: day, newListItem: foundItems });
    });

    let day = date();

});
app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const day = date();
    const item = new Item(
        {
            name: itemName
        }
    );
    if (listName === day && item) {
        item.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

});
app.get("/:customListName", function (req, res) {
    const customListName = lodash.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List(
                    {
                        name: customListName,
                        items: defaultItems
                    }
                );
                list.save();
                res.redirect("/" + customListName);
            }
            else {
                res.render("list.ejs", { listTitle: customListName, newListItem: foundList.items });
            }

        }
    })

});
app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listTitle = req.body.listName;
    const day = date();
    if (listTitle === day) {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err)
                console.log(err);
            else {
                console.log("Successfully deleted");
                res.redirect("/");
            }
        })
    }
    else {
        List.findOneAndUpdate({ name: listTitle }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listTitle);
            }
        });

    }

});

let port = process.env.PORT;
if(port== null || port=="")
    port=3000;
app.get("/about", function (req, res) {
    res.render("about");
});
app.listen(port);
