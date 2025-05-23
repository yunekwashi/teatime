<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->name) &&
    !empty($data->phone) &&
    !empty($data->pickupTime) &&
    !empty($data->items)
) {
    try {
        // Start transaction
        $db->beginTransaction();

        // Insert order
        $order_query = "INSERT INTO orders (customer_name, phone, pickup_time, notes, total_amount, status) 
                       VALUES (:name, :phone, :pickup_time, :notes, :total, 'pending')";
        
        $stmt = $db->prepare($order_query);
        $stmt->bindParam(":name", $data->name);
        $stmt->bindParam(":phone", $data->phone);
        $stmt->bindParam(":pickup_time", $data->pickupTime);
        $stmt->bindParam(":notes", $data->notes);
        $stmt->bindParam(":total", $data->total);
        $stmt->execute();
        
        $order_id = $db->lastInsertId();

        // Insert order items
        $items_query = "INSERT INTO order_items (order_id, item_name, quantity, price) 
                       VALUES (:order_id, :item_name, :quantity, :price)";
        
        $stmt = $db->prepare($items_query);

        foreach ($data->items as $item) {
            $stmt->bindParam(":order_id", $order_id);
            $stmt->bindParam(":item_name", $item->name);
            $stmt->bindParam(":quantity", $item->quantity);
            $stmt->bindParam(":price", $item->price);
            $stmt->execute();
        }

        // Commit transaction
        $db->commit();

        http_response_code(201);
        echo json_encode(array("message" => "Order was created successfully."));
    } catch(Exception $e) {
        // Rollback transaction on error
        $db->rollBack();
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create order: " . $e->getMessage()));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create order. Data is incomplete."));
}
?> 