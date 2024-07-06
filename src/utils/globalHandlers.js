
global.asyncRequestHandler = function (fun) {
  return async function (req, res, next) {
    try {
      await fun(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

global.syncHandler = fn => (...args) => {
  try {
    return fn(...args);
  } catch (error) {
    throw error; 
  }
};

global.asyncHandler = fn => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    throw error; 
  }
};

global.errorObj = function (statusCode, message) {
    const error = new Error(message);
    error.statusCode = statusCode;
    if(!message){
       error.sendEmptyResponse = true;
    }
    return error;
}

