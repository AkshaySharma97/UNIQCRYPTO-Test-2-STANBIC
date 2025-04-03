import React from "react";
import { Link } from "react-router-dom";

function Login() {
   return (
       <div className="container mt-5">
           <div className="row justify-content-center">
               <div className="col-md-4">
                   <h3 className="text-center">Login</h3>
                   <form>
                       <div className="mb-3">
                           <label className="form-label">Username</label>
                           <input type="text" className="form-control" placeholder="Enter username" />
                       </div>
                       <div className="mb-3">
                           <label className="form-label">Passcode</label>
                           <input type="password" className="form-control" placeholder="Enter passcode" />
                       </div>
                       <button type="submit" className="btn btn-primary w-100">Login</button>
                   </form>
                   <div className="mt-3 text-center">
                       <Link to="/register">Register</Link> | 
                       <Link to="/reset-password"> Forgot Password?</Link>
                   </div>
               </div>
           </div>
       </div>
   );
}

export default Login;
