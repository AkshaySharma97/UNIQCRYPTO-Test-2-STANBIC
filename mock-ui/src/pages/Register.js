import React from "react";
import { Link } from "react-router-dom";

function Register() {
   return (
       <div className="container mt-5">
           <div className="row justify-content-center">
               <div className="col-md-4">
                   <h3 className="text-center">Register</h3>
                   <form>
                       <div className="mb-3">
                           <label className="form-label">Username</label>
                           <input type="text" className="form-control" placeholder="Enter username" />
                       </div>
                       <div className="mb-3">
                           <label className="form-label">Passcode</label>
                           <input type="password" className="form-control" placeholder="Enter passcode" />
                       </div>
                       <button type="submit" className="btn btn-success w-100">Register</button>
                   </form>
                   <div className="mt-3 text-center">
                       <Link to="/">Already have an account? Login</Link>
                   </div>
               </div>
           </div>
       </div>
   );
}

export default Register;
