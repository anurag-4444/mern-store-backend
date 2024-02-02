const sendCookie = (user, res, statusCode, token, message) => {

    res
        .status(statusCode)
        .cookie('token', token, {
            httpOnly: true,
            maxAge: 4 * 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
            secure: process.env.NODE_ENV === "Development" ? false : true,
            domain: '.onrender.com',
        })
        .json({
            success: true,
            user,
        })
}

export default sendCookie