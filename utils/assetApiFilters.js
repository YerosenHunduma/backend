class apiFilters {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const { keyword, cities, action } = this.queryStr;
    let filters = {};

    if (keyword) {
      filters.$or = [
        { action: { $regex: keyword, $options: "i" } },
        { brand: { $regex: keyword, $options: "i" } },
        { model: { $regex: keyword, $options: "i" } },
      ];
    }

    if (cities) {
      filters.address = {
        $regex: cities,
        $options: "i",
      };
    }

    if (action) {
      filters.action = action;
    }

    this.query = this.query.find({ ...filters });
    return this;
  }
  filters() {
    const queryCopy = { ...this.queryStr };

    // removing field from query object that are not used for filtering. such as
    // search and page

    const fieldsToRemove = ["keyword", "page", "cities", "sortedBy"];
    fieldsToRemove.forEach((field) => {
      delete queryCopy[field];
    });
    console.log(queryCopy);
    // Advance filter for price, ratings etc
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    console.log(queryStr);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resPerPage) {
    const currentPage = parseInt(this.queryStr.page) || 1;
    // const skip = (currentPage - 1) * resPerPage;
    this.query = this.query.limit(resPerPage * currentPage);
    return this;
  }
  sort(sortedBy) {
    if (sortedBy) {
      const [field, order] = sortedBy.split("_");

      const sortObj = order === "desc" ? { [field]: -1 } : { [field]: 1 };

      this.query = this.query.sort(sortObj);
    } else if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-ratings");
    }
    return this;
  }
}
export default apiFilters;
