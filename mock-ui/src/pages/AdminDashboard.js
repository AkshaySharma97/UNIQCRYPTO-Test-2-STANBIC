import React from "react";

function AdminDashboard() {
   return (
       <div className="container mt-5">
           <h3>Admin Dashboard</h3>
           <table className="table table-bordered">
               <thead>
                   <tr>
                       <th>#</th>
                       <th>Username</th>
                       <th>Role</th>
                   </tr>
               </thead>
               <tbody>
                   <tr><td>1</td><td>JohnDoe</td><td>User</td></tr>
                   <tr><td>2</td><td>JaneAdmin</td><td>Admin</td></tr>
               </tbody>
           </table>
       </div>
   );
}

export default AdminDashboard;
