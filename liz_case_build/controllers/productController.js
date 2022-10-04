import cloudinary from "cloudinary";
import fs from "fs";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import { uploads } from "../middleware/cloudinary.js";

class ProductController {
  async render_home(req, res) {
    res.render("home_page");
  }
  async get_products(req, res) {
    await Product.find({})
      .populate({
        path: "bidders",
        model: "User",
        populate: {
          path: "bid",
          model: "Bid",
        },
      })
      .then((result) => {
        res.status(200).json({
          Length_of_products: result.length,
          products: result,
        });
      })
      .catch((err) => {
        // res.status(400).json({ Errors: err });
        res.render("error_page");
      });
  }
  async render_products(req, res) {
    await Product.find({})
      .populate({
        path: "bidders",
        model: "User",
        populate: {
          path: "bid",
          model: "Bid",
        },
      })
      .then((result) => {
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        res.render("home", { result, options });
      })
      .catch((err) => {
        // res.status(400).json({ Errors: err });
        res.render("error_page");
      });
  }
  async render_login(req, res) {
    res.render("login");
  }
  async get_product_edit_page(req, res) {
    // console.log(req.params.id);
    await Product.findOne({ _id: req.params.id })
      .then((result) => {
        console.log("testing start");
        console.log(result.product_photos[0].replace("./", "/"));
        console.log("testing end");
        res.render("edit_data", { data: result });
      })
      .catch((err) => {
        console.log(err);
        res.render("error_page");
      });
  }

  async get_dashboard(req, res) {
    await Product.find({})
      .populate({
        path: "bidders",
        model: "User",
        populate: {
          path: "bid",
          model: "Bid",
        },
      })
      .then((result) => {
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        res.render("dashboard", { result, options });
      })
      .catch((err) => {
        console.log(err);
        // res.status(400).json({ Errors: err });
        res.render("error_page");
      });
  }
  async render_register(req, res) {
    res.render("signup");
  }
  // testing purpose
  async get_users(req, res) {
    await User.find({})
      .then((result) => {
        res.status(200).json({
          Length_of_products: result.length,
          User: result,
        });
      })
      .catch((err) => {
        // res.status(400).json({ Errors: err });
        res.render("error_page");
      });
  }

  async get_product(req, res) {
    try {
      await Product.findOne({ _id: req.params.id })
        .populate({
          path: "bidders",
          model: "User",
          populate: {
            path: "bid",
            model: "Bid",
          },
        })

        .then((product) => {
          res.status(200).json({
            status: "Product with ID",
            data: {
              data: product,
            },
          });
        })
        .catch((error) => {
          throw new Error(error.message);
        });
    } catch (error) {
      // res.status(404).json({
      //   Message: error.message,
      // });
      res.render("error_page");
    }
  }
  async get_product_one(req, res) {
    try {
      await Product.findOne({ _id: req.params.id })
        .populate({
          path: "bidders",
          model: "User",
          populate: {
            path: "bid",
            model: "Bid",
          },
        })
        .then((product) => {
          let bidders = product.bidders;
          let uniqueBidders = bidders.filter((c, index) => {
            return bidders.indexOf(c) === index;
          });
          uniqueBidders.sort(function (a, b) {
            return b.bid.price - a.bid.price;
          });
          res.render("details", { product, uniqueBidders });
        })
        .catch((error) => {
          throw new Error(error.message);
        });
    } catch (error) {
      // res.status(404).json({
      //   Message: error.message,
      // });
      res.render("error_page");
    }
  }

  async check_before_create_product(req, res, next) {
    const {
      productTitle,
      initial_bid,
      summary,
      description,
      location,
      category,
    } = req.body;
    try {
      if (Object.keys(req.body).length > 0) {
        let bodyKeys = Object.keys(req.body);
        var requiredObject = [
          "productTitle",
          "summary",
          "description",
          "initial_bid",
          "location",
          "category",
        ];
        bodyKeys.forEach((key) => {
          if (!requiredObject.includes(key)) {
            throw new Error(`"${key}" is not part of required body field.`);
          }
        });
      }
      if (Object.keys(req.body).length == 0) {
        throw new Error(
          "You are required to provide an product title, summary and description at least."
        );
      }
      let errors = {};
      if (productTitle == undefined) {
        errors.productTitle = "Product title is not provided";
      }
      if (initial_bid == undefined) {
        errors.initial_bid = "product inital bid is not provided";
      }
      if (summary == undefined) {
        errors.smmary = "Summary is not provided";
      }
      if (description == undefined) {
        errors.description = "Description is not provided";
      }
      if (location == undefined) {
        errors.description = "Description is not provided";
      }
      if (category == undefined) {
        errors.description = "Description is not provided";
      }
      if (Object.values(errors).length > 0) {
        throw errors;
      }
      next();
    } catch (error) {
      // res.status(400).json({
      //   ErrorMessage: error.message,
      //   Errors: error,
      // });
      res.render("error_page");
    }
  }
  async create_product(req, res) {
    const {
      productTitle,
      initial_bid,
      summary,
      description,
      location,
      category,
    } = req.body;
    try {
      let realUrls = [];
      req.files.forEach((file) => {
        realUrls.push(`${file.destination}/${file.filename}`);
      });

      await Product.create({
        productTitle,
        summary,
        description,
        initial_bid,
        product_photos: realUrls,
        location,
        category,
      })
        .then((result) => {
          // res.status(200).json({
          //   Message: "Product Successful created!!!",
          //   product: result,
          // });
          res.redirect("/user_dashboard");
        })
        .catch((err) => {
          console.log(err);
          // res.status(400).json({
          //   savingProcess: "Error",
          //   ErrorMessage: err.message,
          //   Errors: err,
          // });
          res.render("error_page");
        });
    } catch (error) {
      res.status(400).json({ ErrorMessage: error.message, Errors: error });
    }
  }

  async create_testing(req, res, next) {
    console.log(req.body);
    // console.log(req.files);
    let files = [];
    req.files.forEach((file) => {
      files.push(`${file.destination}/${file.filename}`);
    });
    console.log(files);
    res.send("best testing");
  }

  async check_before_update_product(req, res, next) {
    console.log(req.files);
    try {
      if (req.file || req.files.length > 0) {
        console.log("updating image process");
      }
      if (Object.keys(req.body).length == 0 && req.files.length <= 0) {
        throw new Error(
          "Nothing to update, you must provide a field you want to update"
        );
      }
      if (Object.keys(req.body).length > 0) {
        let bodyKeys = Object.keys(req.body);
        var requiredObject = [
          "productTitle",
          "summary",
          "description",
          "initial_bid",
          "location",
          "category",
        ];
        bodyKeys.forEach((key) => {
          if (!requiredObject.includes(key)) {
            throw new Error(`"${key}" is not part of required body field.`);
          }
        });
      }
      next();
    } catch (error) {
      console.log(error);
      // res.status(404).json({
      //   Message: error.message,
      //   Error: error,
      // });
      res.render("error_page");
    }
  }

  async update_product(req, res) {
    try {
      await Product.findById(req.params.id)
        .then(async (doc) => {
          if (req.files.length > 0) {
            doc.product_photos.forEach((photo) => {
              fs.unlinkSync(photo);
            });
            let realUrls = [];
            req.files.forEach((file) => {
              realUrls.push(`${file.destination}/${file.filename}`);
            });

            doc.product_photos = realUrls;
          } else {
            doc.product_photos = doc.product_photos;
          }

          if (req.body.description) {
            doc.description = req.body.description;
          } else {
            doc.description = doc.description;
          }

          if (req.body.productTitle) {
            doc.productTitle = req.body.productTitle;
          } else {
            doc.productTitle = doc.productTitle;
          }

          if (req.body.initial_bid) {
            doc.initial_bid = req.body.initial_bid;
          } else {
            doc.initial_bid = doc.initial_bid;
          }

          if (req.body.summary) {
            doc.summary = req.body.summary;
          } else {
            doc.summary = doc.summary;
          }
          if (req.body.location) {
            doc.location = req.body.location;
          } else {
            doc.location = doc.location;
          }
          if (req.body.category) {
            doc.category = req.body.category;
          } else {
            doc.category = doc.category;
          }

          let data = await doc.save();
          // res.status(200).json({
          //   status: "successful updated",
          //   data: {
          //     data: data,
          //   },
          // });
          res.redirect("/home");
        })
        .catch((err) => {
          res.status(400).json({
            Message: "Error Occured",
            errorMessage: err.message,
          });
        });
    } catch (error) {
      // res.status(404).json({
      //   Message: error.message,
      //   Error: error,
      // });
      res.render("error_page");
    }
  }

  async delete_product(req, res) {
    try {
      const doc = await Product.findByIdAndDelete(req.params.id);

      if (!doc) {
        throw new Error("No document found with that ID");
      }

      // let idss = doc.product_photos;
      // for (let i = 0; i < idss.length; i++) {
      //   await cloudinary.v2.uploader.destroy(idss[i]);
      //   fs.unlinkSync(idss[i]);
      // }
      doc.product_photos.forEach((photo) => {
        fs.unlinkSync(photo);
      });
      // res.status(202).json({
      //   status: "success",
      //   data: null,
      // });
      res.redirect("/home");
    } catch (error) {
      // console.log(error);
      // res.status(404).json({
      //   Message: error.message,
      // });
      res.render("error_page");
    }
  }

  async main_search(req, res) {
    const { searchItem } = req.query;
    const filter = {
      $or: [{ productTitle: { $regex: searchItem } }],
    };
    try {
      if (searchItem) {
        const regex = new RegExp(escapeRegex(searchItem), "gi");
        const docs = await Product.find({
          // visibility: true,
          $or: [
            { productTitle: regex },
            { summary: regex },
            { description: regex },
          ],
        }).sort({
          createdAt: "desc",
        });
        if (!docs) {
          throw new Error("No document found with that ID");
        }
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        res.render("home", { result: docs, options });
        // res.status(200).render("amazu", {
        //   title: `Search Results `,
        //   amazu,
        // });
      }
    } catch (error) {
      console.log(error);
      // res.status(404).json({
      //   Message: error.message,
      // });
      res.render("error_page");
    }
  }

  async category_house(req, res) {
    await Product.find({
      $or: [{ category: { $regex: "house" } }],
    })
      .populate({
        path: "bidders",
        model: "User",
        populate: {
          path: "bid",
          model: "Bid",
        },
      })
      .then((result) => {
        res.status(200).json({
          Length_of_products: result.length,
          products: result,
        });
      })
      .catch((err) => {
        // res.status(400).json({ Errors: err });
        res.render("error_page");
      });
  }
  async category_houses(req, res) {
    search_factory("house", req, res);
  }
  async category_computers(req, res) {
    search_factory("computer", req, res);
  }
  async category_fashions(req, res) {
    search_factory("fashion", req, res);
  }
  async category_furnitues(req, res) {
    search_factory("furnitue", req, res);
  }
  async category_cars(req, res) {
    search_factory("car", req, res);
  }
}
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

async function search_factory(model, req, res) {
  await Product.find({
    $or: [{ category: { $regex: model } }],
  })
    .populate({
      path: "bidders",
      model: "User",
      populate: {
        path: "bid",
        model: "Bid",
      },
    })
    .then((result) => {
      // res.status(200).json({
      //   Length_of_products: result.length,
      //   products: result,
      // });
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      console.log("testing start");
      result.forEach((p) => {
        console.log(p.product_photos[0]);
      });
      console.log("testing end");
      res.render("home", { result, options });
    })
    .catch((err) => {
      console.log(err);
      // res.status(400).json({ Errors: err });
      res.render("error_page");
    });
}

export default ProductController;
