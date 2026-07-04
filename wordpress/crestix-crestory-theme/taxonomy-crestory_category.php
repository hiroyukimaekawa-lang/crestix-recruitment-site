<?php
$term = get_queried_object();

wp_safe_redirect(crestix_crestory_category_home_url($term), 301);
exit;
