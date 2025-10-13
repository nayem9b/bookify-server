const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Handle validation errors
  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: err.errors || err.message
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    return res.status(400).json({
      status: 'error',
      message: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  // Default to 500 server error
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
};

module.exports = errorHandler;
