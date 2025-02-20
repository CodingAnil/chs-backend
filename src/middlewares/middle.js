// Middleware to set query type
const setQueryType = (type) => (req, res, next) => {
  req.query.type = type;
  next();
};

module.exports = { setQueryType };
