const Product = require('../models/product.model')
const { validationResult } = require('express-validator/check')
var mongoose = require('mongoose');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: "Add Product",
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: [],
        validationErrors: []
    });
};

exports.postAddProduct = (req, res, next) => {
    const { title, price, description, imageUrl } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array()[0])
        return res
            .status(422)
            .render('admin/edit-product', {
                pageTitle: "Add Product",
                path: '/admin/add-product',
                editing: false,
                product: {
                    title: title,
                    imageUrl: imageUrl,
                    price: price,
                    description: description,
                },
                hasError: true,
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array()
            })
    }

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        userId: req.user
    });

    product
        .save()
        .then(result => {
            console.log("Data Added to Database")
            res.redirect('/')
        })
        .catch(err => { console.log(err) });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;

    if (!editMode) {
        return res.redirect('/')
    };

    const prodId = req.params.productId;

    Product
        .findById(prodId)
        .then(product => {

            if (!product) {
                return res.redirect('/')
            }

            res.render('admin/edit-product', {
                pageTitle: "Edit Product",
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: [],
                validationErrors: []
            })
        })
        .catch(err => { console.log(err) });
};

exports.getProducts = (req, res, next) => {
    Product
        // .find()
        .find({ userId: req.user._id })
        // This helps to retrive specific fields from data eg: ONLY title, price && -(minus) sign tells to exclude that field i.e., _id
        // .select('title price -_id')
        // Helps to populate the related field for you data
        // .populate('userId')
        .then(products => {
            console.log(products)
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => { console.log(err) });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;

    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const updatedImageUrl = req.body.imageUrl;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array()[0])
        return res
            .status(422)
            .render('admin/edit-product', {
                pageTitle: "Edit Product",
                path: '/admin/edit-product',
                editing: true,
                product: {
                    title: updatedTitle,
                    imageUrl: updatedImageUrl,
                    price: updatedPrice,
                    description: updatedDescription,
                    _id: productId
                },
                hasError: true,
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array()
            });
    }

    Product
        .findById(mongoose.Types.ObjectId(productId))
        .then(product => {

            if (product.userId.toString() !== req.user._id.toString()) {
                req.flash('error', "You don't have permission to edit this product.");
                return res.redirect('/');
            }

            product.title = updatedTitle
            product.price = updatedPrice
            product.description = updatedDescription
            product.imageUrl = updatedImageUrl

            return product
                .save()
                .then(result => {
                    console.log("Product Updated")
                    return res.redirect('/admin/products');
                });
        })
        .catch(err => { console.log(err) });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;

    Product
        .deleteOne({ _id: prodId, userId: req.user._id })
        .then(result => {
            console.log('PRODUCT DESTROYED!')
            return res.redirect('/admin/products')
        })
        .catch(err => { console.log(err) });

};