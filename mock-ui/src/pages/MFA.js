import React from "react";

function MFA() {
   return (
       <div className="container mt-5">
           <div className="row justify-content-center">
               <div className="col-md-4">
                   <h3 className="text-center">Multi-Factor Authentication</h3>
                   <form>
                       <div className="mb-3">
                           <label className="form-label">Enter MFA OTP</label>
                           <input type="text" className="form-control" placeholder="Enter MFA OTP" />
                       </div>
                       <button type="submit" className="btn btn-primary w-100">Verify</button>
                   </form>
               </div>
           </div>
       </div>
   );
}

export default MFA;
