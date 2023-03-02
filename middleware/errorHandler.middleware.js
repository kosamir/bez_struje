export default function(err, req, res, next) {
  let error;
  if (typeof err.message === "string") {
    error = {
      message: err.message,
      code: err.status,
      status: err.status
    };
  } else {
    error = {
      errors: err.message,
      code: err.status,
      status: err.status
    };
  }
  res.status(error.code).json(error);
}
