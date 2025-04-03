import React from "react";

function ResetPassword() {
   return (
       <div className="container mt-5">
           <div className="row justify-content-center">
               <div className="col-md-4">
                   <h3 className="text-center">Reset Password</h3>
                   <form>
                       <div className="mb-3">
                           <label className="form-label">Enter Your Email</label>
                           <input type="email" className="form-control" placeholder="Enter email" />
                       </div>
                       <button type="submit" className="btn btn-warning w-100">Send Reset Link</button>
                   </form>
               </div>
           </div>
       </div>
   );
}

export default ResetPassword;
