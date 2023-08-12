const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const User = require("../models/userModel");
const { sanitizeUserLogged , sanitizeLogin } = require("../utils/sanitizeData");



exports.deleteOneDoc = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`Document not found`, 404));
    }

    document.remove();
    res.status(204).json({ message: `Document deleted` });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { _id } = req.params;
    const document = await Model.findOneAndUpdate({ _id }, req.body, {
      new: true,
    });

    if (!document) {
      return next(new ApiError("Document don't update", 400));
    }

    document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const document = await Model.create(req.body);

    console.log(document);

    if (!document) {
      return next(new ApiError("Document don`t create", 404));
    }

    res.status(200).json(document);
  });

exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res, next) => {

    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }

    const countDocumentss = await Model.countDocuments();

    // eslint-disable-next-line eqeqeq
    const newDocument = new ApiFeatures(Model.find(filter), req.query)
      .paginate(countDocumentss)
      .search(modelName)
      .limitFieled()
      .sort()
      .filter();

    const { mongooseQuery, paginateResult } = newDocument;
    const Document = await mongooseQuery;

    if(Model === User){
      return res.status(200)
      .json({ result: Document.length, paginateResult, data: Document.map((user) => sanitizeLogin(user))});
    }

    res
      .status(200)
      .json({ result: Document.length, paginateResult, data: Document });
  });

exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params || req.body;
    let query = Model.findById(id);

    console.log(Model);

    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    const document = await query;

    if (!document) {
      return next(new ApiError("Document not found", 404));
    }

    if (Model === User) {
      res.status(200).json({ data: sanitizeUserLogged(document) });
    }


    res.status(200).json({ data: document });
  });
