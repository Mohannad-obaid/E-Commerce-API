exports.sanitizeUser = function (user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,     
    };
}


exports.sanitizeLogin = function (user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        wishlist : user.wishlist,
        addresses : user.addresses,
        phone : user.phone,
    };
}


exports.sanitizeUserLogged = function (user) {
    return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone : user.phone,
        profileImage : user.profileImage,
    };
}