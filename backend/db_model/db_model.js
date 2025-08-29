// CREATE TABLE cartdata (
//     id INT AUTO_INCREMENT PRIMARY KEY,       
//     productId INT NOT NULL,                  
//     attributes JSON NOT NULL,                
//     seller JSON NOT NULL,                    
//     seller_id INT GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(seller, '$.id'))) STORED,  
//     count INT NOT NULL,                      
//     max INT NOT NULL,                        
//     price JSON NOT NULL,                     
//     combinationsID INT NOT NULL,             
//     image VARCHAR(255) NOT NULL,             
//     name VARCHAR(255) NOT NULL,              
//     UNIQUE KEY unique_seller_combination (seller_id, combinationsID) -- ✅ Unique on seller_id + combinationsID
//   );
  