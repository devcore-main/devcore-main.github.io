// references to inputs
const user_email = document.getElementById("uemail");
const user_password = document.getElementById("password");
const uname = document.getElementById("uname");
const loginForm = document.getElementById("loginForm");

// course list
let course_list = [{
        course_name: "JavaScript Basics",
        course_id: 100001,
        course_description: "An introductory course to JavaScript.",
        creator: "yusef"
    },
    {
        course_name: "backend -.net",
        course_id: 100003,
        course_description: "Learn backend development with .net framework.",
        creator: "mina"
    },
    {
        course_name: "frontend",
        course_id: 100004,
        course_description: "learn frontend development with html css js.",
        creator: "seif"
    },
    {
        course_name: "desktop application",
        course_id: 100005,
        course_description: "Learn desktop application development",
        creator: "mohamed"
    }
];

// simple DB
let user_db = [{
        uname: "yusuf",
        pass: "dev_core_26.5.2025",
        email: "devcore.communicate@gmail.com",
        premissions: "admin",
        user_id: 1001
    },
    {
        uname: "seif",
        pass: "dev_core_26.5.2025",
        email: "devcore.communicate@gmail.com",
        premissions: "admin",
        user_id: 1002
    },
    {
        uname: "mina",
        pass: "dev_core_26.5.2025",
        email: "devcore.communicate@gmail.com",
        premissions: "admin",
        user_id: 1003
    },
    {
        uname: "adel",
        pass: "dev_core_26.5.2025",
        email: "devcore.communicate@gmail.com",
        premissions: "admin",
        user_id: 1004
    }
];

// generate unique ID
let last_id = 1500;

// validate input
function data_validation(reqdata) {
    let xss = /[<>\"'%;)(&+]/;
    let sql = /(\bunion\b|\bselect\b|\binsert\b|\bdelete\b|\bupdate\b|\bdrop\b|\bcreate\b|\balter\b|--|;)/i;

    for (let v of[reqdata.uname, reqdata.pass, reqdata.email]) {
        if (xss.test(v) || sql.test(v)) return false;
    }
    return true;
}

// determine permission
function get_permission(email) {
    return email === "devcore.communicate@gmail.com" ?
        "admin" :
        "user";
}

// on form submit
loginForm.addEventListener("submit", function(e) {
    e.preventDefault();

    let reqdata = {
        uname: uname.value,
        pass: user_password.value,
        email: user_email.value
    };

    if (!data_validation(reqdata)) {
        console.error("Invalid input");
        alert("Invalid input detected");
        return;
    }

    user_db.push({
        ...reqdata,
        premissions: get_permission(reqdata.email),
        user_id: ++last_id
    });

    console.log("User added:", reqdata);
});
