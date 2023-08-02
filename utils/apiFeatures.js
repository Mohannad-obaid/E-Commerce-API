class ApiFeatures {
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString;
    };


    filter() {
        // 1-Filtering
        const queryStringObj = { ...this.queryString };
        const excludesFields = ['page', 'sort', 'limit', 'fields','keyword'];
       excludesFields.forEach((field) => delete queryStringObj[field]);
        
        let queryStr = JSON.stringify(queryStringObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

        return this;
    }


    sort() {
        // 3-Sorting
        if (this.queryString.sort) {
            this.mongooseQuery = this.mongooseQuery.sort(this.queryString.sort.split(',').join(' '));
        }

        return this;
    }

    limitFieled() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.mongooseQuery = this.mongooseQuery.select(fields)
        }

        return this;
    }


    search(modelName) {
        if (this.queryString.keyword || this.queryString.name ) {
            // eslint-disable-next-line prefer-const
            let query = {};

            if (modelName === 'products'){
            query.$or = [
                { title: { $regex: this.queryString.keyword, $options: 'i' } },
                { description: { $regex: this.queryString.keyword, $options: 'i' } },
            ];
        }else {
            query.$or = [{ name: { $regex: this.queryString.keyword, $options: 'i' } }];
        }

            this.mongooseQuery = this.mongooseQuery.find(query);
        }

        return this;
    }


    paginate(countDocuments) {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 5;
        const skip = (page - 1) * limit;
        const endIndex = page * limit;

        const paginate ={};
        paginate.currentPge = page;
        paginate.limit = limit;
        paginate.numberOfPages = Math.ceil(countDocuments / limit);

        if (endIndex < countDocuments) {
            paginate.next = page + 1;
        }

        if (skip > 0) {
            paginate.prev = page - 1;
        }


        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
        this.paginateResult = paginate;


        return this;
    }





}

module.exports = ApiFeatures;