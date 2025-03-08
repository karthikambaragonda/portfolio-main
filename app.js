import express from "express";
import qr from "qr-image";
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";
import pg from "pg";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import GoogleStrategy from "passport-google-oauth2";
import env from "dotenv";
import flash from "connect-flash";
import axios from "axios";
import moment from "moment-timezone";

env.config()
const app = express();
const port = 4000;

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 2 * 7 * 24 * 60 * 60 * 1000,
    },
  })
);
3
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
app.use(flash());

app.get("/", (req, res) => {
  res.render("index.ejs");
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/qr", (req, res) => {
  res.render("qr.ejs");
});

app.get("/projects", (req, res) => {
  res.render("projects.ejs");
});
app.get("/char", (req, res) => {
  res.render("char.ejs");
});
app.get("/string", (req, res) => {
  res.render("string.ejs");
});
app.get("/tt", function (req, res) {
  res.redirect('https://karthikambaragonda.github.io/Time-Table/');
});
app.get("/dice", (req, res) => {
  res.render("dice.ejs");
});


app.get("/generateQRCode", (req, res) => {
  const url = req.query.url;
  const qr_svg = qr.image(url, { type: 'png' });
  res.type('png');
  qr_svg.pipe(res);

  fs.appendFile("URL.txt", url + '\n', (err) => {
    if (err) throw err;
  });
});
app.get("/qrsecret", (req, res) => {
  fs.readFile('URL.txt', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error reading the file');
    }
    res.set('Content-Type', 'text/plain');
    res.send(data);
  });
});

// connecting to db //
const db = new pg.Client({
  connectionString: process.env.PG_STR,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database", err);
  } else {
    console.log("Connected to the database");
  }
  db.on("error", (err) => {
    console.error("Database connection error:", err);
    if (err.code === "ECONNRESET" || err.code === "EPIPE") {
      console.log("Attempting to reconnect to the database...");
      db.connect()
        .then(() => {
          console.log("Reconnected to the database successfully");
        })
        .catch((error) => {
          console.error("Failed to reconnect to the database:", error);
        });
    }
  });
});

//admin//
app.get("/admin", (req, res) => {
  res.render("admin.ejs");
});

app.post('/adminlogin', passport.authenticate('admin', {
  successRedirect: '/adminusers',
  failureRedirect: '/admin',
  failureFlash: true
}));

app.get('/adminusers', isAuthenticatedlocal, (req, res) => {
  db.query("SELECT * FROM blog")
    .then((result) => {
      if (result.rows.length > 0) {
        res.render("admin_users.ejs", { users: result.rows });
      } else {
        res.json({ message: "No users found" });
      }
    })
    .catch((err) => {
      console.error("Error executing query:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

app.get("/deleteuser/:email", (req, res) => {
  const email = req.params.email;
  console.log(email);
  db.query("delete from blog where email=$1;", [email]);
  res.redirect("/adminusers");
});

app.get("/emailexist", (req, res) => {
  res.render("emailexist.ejs");
})
app.get("/signupsuccess", (req, res) => {
  res.render("success.ejs")
})

app.get("/recover", (req, res) => {
  res.render("recover.ejs");
});


app.post("/recover", (req, res) => {
  const { email, s_answer } = req.body;
  db.query(
    "SELECT name, email, password FROM blog WHERE email = $1 AND security_answer = $2",
    [email, s_answer],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ error: "Internal server error" });
      } else {
        if (result.rows.length > 0) {
          res.render("users.ejs", { users: result.rows });
        } else {
          res.send("No user Found or Wrong Password Entered!");
        }
      }
    }
  );
});

// app.get("/adminusers", (req, res) => {
//   db.query("SELECT * FROM blog")
//     .then((result) => {
//       if (result.rows.length > 0) {
//         res.render("admin_users.ejs", { users: result.rows });
//       } else {
//         res.json({ message: "No user found" });
//       }
//     })
//     .catch((err) => {
//       console.error("Error executing query:", err);
//       res.status(500).json({ error: "Internal server error" });
//     });
// });


//////////////////////////////blog////////////////////////////


app.get("/blog-login", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('/blog');
  } else {
    res.render("login.ejs", { message: req.flash('error') });
  }

});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/blog",
    failureRedirect: "/blog-login",
    failureFlash: true,
    failureFlash: " Invalid Credentials. Please try again or Sign in with google."
  })
);

app.get("/blog", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const response = await db.query("SELECT *FROM blog JOIN posts ON blog.email = posts.email; ");
      res.render("blog.ejs", { posts: response.rows, user: req.user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching posts" });
    }
  } else {
    res.redirect("/blog-login");
  }
});
app.get("/new", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("modify.ejs", { heading: "New Post", submit: "Create Post", user: req.user, });
  } else {
    res.redirect("/blog-login");
  }
});

app.get("/edit/:id", ensureAuthenticated, async (req, res) => {
  try {
    const email = req.user.email;
    const id = req.params.id;
    const response = await db.query("SELECT * FROM posts WHERE email = $1 AND id = $2", [email, id]);

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    console.log(response.rows[0]);

    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response.rows[0],
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ message: "Error fetching post" });
  }
});

app.post("/posts", ensureAuthenticated, async (req, res) => {
  try {
    const email = req.user.email;
    const { id, title, posts } = req.body;
    const response = await db.query(
      "INSERT INTO posts (email,title,posts) VALUES ($1, $2, $3) RETURNING *",
      [email, title, posts]
    );
    console.log(response.rows);
    res.redirect("/blog");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating post" });
  }
});
//edit
app.post("/posts/:id", ensureAuthenticated, async (req, res) => {
  console.log("called");
  try {
    // const id = ;
    const email = req.user.email;
    const { title, posts, id } = req.body;
    const response = await db.query(
      "UPDATE posts SET title=$1, posts=$2, date=CURRENT_TIMESTAMP WHERE email=$3 AND id=$4 RETURNING *",
      [title, posts, email, id]
    );
    console.log(response.rows);
    if (response.rows.length > 0) {
      res.redirect("/blog");
    } else {
      res.status(404).json({ message: "Post not found or not authorized" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating post" });
  }
});

app.get("/posts/delete/:id", ensureAuthenticated, async (req, res) => {
  try {
    const email = req.user.email;
    const id = req.params.id;

    const response = await db.query("DELETE FROM posts WHERE email = $1 AND id = $2;",
      [email, id]
    );
    console.log(response.rows);

    res.redirect("/blog");

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating post" });
  }
});


app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/blog-login");
  });
});
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/blog",
  passport.authenticate("google", {
    successRedirect: "/blog",
    failureRedirect: "/blog-login",
  })
);


app.get("/signup", (req, res) => {
  res.render("app.ejs");
})
app.post("/signup", async (req, res) => {
  const { email, name, password, security_question, security_answer, role } = req.body;

  try {
    const checkResult = await db.query("SELECT * FROM blog WHERE email = $1", [email]);

    if (checkResult.rows.length > 0) {
      return res.redirect("/emailexist");
    } else {
      await db.query(
        "INSERT INTO blog (email, name, password, security_question, security_answer) VALUES ($1, $2, $3, $4, $5)",
        [email, name, password, security_question, security_answer]
      );
      req.login({ email, name }, (err) => {
        if (err) {
          return res.status(500).send("Login error");
        }
        res.redirect("/signupsuccess");
      });
    }
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).send("Internal server error");
  }
});


passport.use(
  new Strategy({ usernameField: 'email' }, async function verify(email, password, cb) {
    try {
      const result = await db.query("SELECT * FROM blog WHERE email = $1 AND password = $2", [email, password]);

      if (result.rows.length > 0) {
        const user = result.rows[0];
        return cb(null, user);
      } else {
        return cb(null, false, { message: "Incorrect email or password." });
      }
    } catch (err) {
      console.error("Error during authentication:", err);
      return cb(err);
    }
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://karthik-portfolio.onrender.com/auth/google/blog",
      userProfileURL: "https://accounts.google.com/o/oauth2/auth",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result = await db.query("SELECT * FROM blog WHERE email = $1", [
          profile.email,
        ]);
        const name = profile.displayName;
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO blog (name,email,password) VALUES ($1,$2,$3)",
            [name, profile.email, "google"]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);
passport.use(
  "admin",
  new Strategy({ usernameField: 'email' }, async function (email, password, cb) {
    try {
      const adminemail = "ambaragondakarthik@gmail.com";
      if (adminemail.toLowerCase() === email.toLowerCase()) {
        const adminResult = await db.query("SELECT * FROM blog WHERE email = $1 AND password = $2 ", [email, password]);
        if (adminResult.rows.length > 0) {
          cb(null, adminResult.rows[0]);
        } else {
          cb(null, false);
        }
      } else {
        cb(null, false);
      }
    } catch (err) {
      console.log(err);
      cb(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/blog-login');
}
function isAuthenticatedlocal(req, res, next) {
  if (req.isAuthenticated() && req.user.email === 'ambaragondakarthik@gmail.com') {
    return next();
  }
  res.redirect('/admin');
}

///////////////weather///////////////////
const datew = new Date();
const dateString = datew.toString();
const date = dateString.substring(0, 10);
console.log(date);
const key = process.env.KEY;
app.get("/weather", async (req, res) => {

  res.render("loc.ejs");
});
app.get("/get-weather", async (req, res) => {
  const city = req.query.city;
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`);
    const result = response.data;
    console.log(result);
    const tempCelsius = Celsius(result.main.temp);
    const temp_Min = Celsius(result.main.temp_min);
    const temp_Max = Celsius(result.main.temp_max);
    const feel = Celsius(result.main.feels_like);
    const humidity = result.main.humidity;
    const iconcode = result.weather[0].icon;
    const sunrise = convertToIST(result.sys.sunrise);
    const sunset = convertToIST(result.sys.sunset);
    const src = `http://openweathermap.org/img/w/${iconcode}.png`;
    res.render("weather.ejs", {
      date,
      location: result.name,
      temperature: tempCelsius,
      min: temp_Min,
      max: temp_Max,
      feel,
      humidity,
      description: result.weather[0].main,
      iconcode: src,
      sunrise: sunrise,
      sunset,
      errorMessage: null
    });
  } catch (error) {
    let errorMessage;
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      errorMessage = `Error: ${error.response.data.message}`;
    } else if (error.request) {
      console.log(error.request);
      errorMessage = "Error: No response received from API";
    } else {
      console.log('Error', error.message);
      errorMessage = `Error: ${error.message}`;
    }
    res.render("weather.ejs", {
      date: null,
      location: null,
      temperature: null,
      min: null,
      max: null,
      feel: null,
      humidity: null,
      description: null,
      iconcode: null,
      sunrise: null,
      sunset: null,
      errorMessage: errorMessage
    });
  }
});
const Celsius = (kelvin) => {
  return (kelvin - 273.15).toFixed(0);
};
const convertToIST = (timestamp) => {
  return moment.unix(timestamp).tz('Asia/Kolkata').format('hh:mm A');
};

///////////////////
app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);

});                                                    