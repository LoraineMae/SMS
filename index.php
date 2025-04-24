<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMS Contacts Management</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            color: #333;
        }
        section {
            margin-bottom: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 20px;
        }
        label {
            display: inline-block;
            width: 120px;
            text-align: right;
            margin-right: 10px;
        }
        input[type="text"] {
            width: 300px;
            padding: 5px;
            margin: 5px 0;
        }
        input[type="submit"], button {
            padding: 5px 15px;
            margin: 5px 0 5px 130px;
            cursor: pointer;
        }
        .example {
            color: #666;
            font-size: 0.9em;
            margin-left: 5px;
        }
        .status {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .status-success {
            background-color: #dff0d8;
            color: #3c763d;
        }
        .status-info {
            background-color: #d9edf7;
            color: #31708f;
        }
        .status-warning {
            background-color: #fcf8e3;
            color: #8a6d3b;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f2f2f2;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        h2 {
            color: blue;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>SMS Contacts Management</h1>
        
        <?php
        include 'db_connect.php';
        
        // Process messages
        if (isset($_GET['status'])) {
            $status = $_GET['status'];
            if ($status == 'added') {
                echo "<div class='status status-success'>Record added successfully!</div>";
            } elseif ($status == 'updated') {
                echo "<div class='status status-info'>Record updated successfully!</div>";
            } elseif ($status == 'deleted') {
                echo "<div class='status status-warning'>Record deleted successfully!</div>";
            } elseif ($status == 'notfound') {
                echo "<div class='status status-warning'>Record not found!</div>";
            }
        }
        
        // For update and delete - search results storage
        $update_record = null;
        $delete_record = null;
        
        // Handle search for update
        if (isset($_POST['update_search'])) {
            $search_studno = $_POST['update_studno'];
            $sql = "SELECT * FROM tblSMS WHERE studno = '$search_studno'";
            $result = $conn->query($sql);
            
            if ($result->num_rows > 0) {
                $update_record = $result->fetch_assoc();
            }
        }
        
        // Handle search for delete
        if (isset($_POST['delete_search'])) {
            $search_studno = $_POST['delete_studno'];
            $sql = "SELECT * FROM tblSMS WHERE studno = '$search_studno'";
            $result = $conn->query($sql);
            
            if ($result->num_rows > 0) {
                $delete_record = $result->fetch_assoc();
            }
        }
        
        // Add Record
        if (isset($_POST['add'])) {
            $studno = $_POST['add_studno'];
            $name = $_POST['add_name'];
            $cpno = $_POST['add_cpno'];
            
            $sql = "INSERT INTO tblSMS (studno, name, cpno) VALUES ('$studno', '$name', '$cpno')";
            
            if ($conn->query($sql) === TRUE) {
                header("Location: index.php?status=added");
                exit;
            } else {
                echo "Error: " . $sql . "<br>" . $conn->error;
            }
        }
        
        // Update Record
        if (isset($_POST['update'])) {
            $sms_ID = $_POST['update_id'];
            $studno = $_POST['update_studno'];
            $name = $_POST['update_name'];
            $cpno = $_POST['update_cpno'];
            
            $sql = "UPDATE tblSMS SET studno='$studno', name='$name', cpno='$cpno' WHERE sms_ID=$sms_ID";
            
            if ($conn->query($sql) === TRUE) {
                header("Location: index.php?status=updated");
                exit;
            } else {
                echo "Error: " . $sql . "<br>" . $conn->error;
            }
        }
        
        // Delete Record
        if (isset($_POST['delete'])) {
            $sms_ID = $_POST['delete_id'];
            
            $sql = "DELETE FROM tblSMS WHERE sms_ID=$sms_ID";
            
            if ($conn->query($sql) === TRUE) {
                header("Location: index.php?status=deleted");
                exit;
            } else {
                echo "Error: " . $sql . "<br>" . $conn->error;
            }
        }
        ?>
        
        <!-- Add Record Section -->
        <section>
            <form method="post" action="">
                <div>
                    <label for="add_studno">Student Number :</label>
                    <input type="text" id="add_studno" name="add_studno" required>
                </div>
                <div>
                    <label for="add_name">Name :</label>
                    <input type="text" id="add_name" name="add_name" required>
                </div>
                <div>
                    <label for="add_cpno">CP No. :</label>
                    <input type="text" id="add_cpno" name="add_cpno" required>
                    <span class="example">(ex. 639201234567)</span>
                </div>
                <div>
                    <input type="submit" name="add" value="Save">
                </div>
            </form>
        </section>
        
        <!-- Update Record Section -->
        <section>
            <h2>Update Record</h2>
            <form method="post" action="">
                <div>
                    <label for="update_studno">Student Number :</label>
                    <input type="text" id="update_studno" name="update_studno" required>
                    <input type="submit" name="update_search" value="Search">
                </div>
            </form>
            
            <?php if ($update_record): ?>
                <form method="post" action="">
                    <input type="hidden" name="update_id" value="<?php echo $update_record['sms_ID']; ?>">
                    <input type="hidden" name="update_studno" value="<?php echo $update_record['studno']; ?>">
                    <div>
                        <label for="update_name">Name :</label>
                        <input type="text" id="update_name" name="update_name" value="<?php echo $update_record['name']; ?>" required>
                    </div>
                    <div>
                        <label for="update_cpno">CP No. :</label>
                        <input type="text" id="update_cpno" name="update_cpno" value="<?php echo $update_record['cpno']; ?>" required>
                        <span class="example">(ex. 639201234567)</span>
                    </div>
                    <div>
                        <input type="submit" name="update" value="Update">
                    </div>
                </form>
            <?php endif; ?>
        </section>
        
        <!-- Delete Record Section -->
        <section>
            <h2>Delete Record</h2>
            <form method="post" action="">
                <div>
                    <label for="delete_studno">Student Number :</label>
                    <input type="text" id="delete_studno" name="delete_studno" required>
                    <input type="submit" name="delete_search" value="Search">
                </div>
            </form>
            
            <?php if ($delete_record): ?>
                <form method="post" action="">
                    <input type="hidden" name="delete_id" value="<?php echo $delete_record['sms_ID']; ?>">
                    <div>
                        <label for="delete_name">Name :</label>
                        <input type="text" id="delete_name" name="delete_name" value="<?php echo $delete_record['name']; ?>" readonly>
                    </div>
                    <div>
                        <label for="delete_cpno">CP No. :</label>
                        <input type="text" id="delete_cpno" name="delete_cpno" value="<?php echo $delete_record['cpno']; ?>" readonly>
                        <span class="example">(ex. 639201234567)</span>
                    </div>
                    <div>
                        <input type="submit" name="delete" value="Delete">
                    </div>
                </form>
            <?php endif; ?>
        </section>
        
        <!-- Records Table -->
        <section>
            <h2>Record List</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Student Number</th>
                        <th>Name</th>
                        <th>CP Number</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    $sql = "SELECT * FROM tblSMS ORDER BY sms_ID DESC";
                    $result = $conn->query($sql);
                    
                    if ($result->num_rows > 0) {
                        while($row = $result->fetch_assoc()) {
                            echo "<tr>";
                            echo "<td>" . $row['sms_ID'] . "</td>";
                            echo "<td>" . $row['studno'] . "</td>";
                            echo "<td>" . $row['name'] . "</td>";
                            echo "<td>" . $row['cpno'] . "</td>";
                            echo "</tr>";
                        }
                    } else {
                        echo "<tr><td colspan='4'>No records found</td></tr>";
                    }
                    ?>
                </tbody>
            </table>
        </section>
        
    </div>
</body>
</html>