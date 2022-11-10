const middleware_dashboard = require("../middleware/dashboard_authentication");
const adminDashboard = require('../models/ADMINDASHBOARD/mainModel');
const invalidRoute = require('./invalidRoute');
const routes = [
	// {
	// 	method: 'GET',
	// 	url: '/delivery/get_delivery_task_by_dates',
	// 	preHandler: middleware_dashboard.authenticateToken,
	// 	preHandler: middleware_dashboard.authenticateToken,
	//	handler: delivery.get_delivery_task_by_dates
	// },
	{
		method: 'GET',
		url: '/dashboard/get_user_density',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_user_density
	},
	{
		method: 'POST',
		url: '/dashboard/forgot_password_mail',
		//preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.forgot_password_mail
	},
	{
		method: 'GET',
		url: '/dashboard/notification_list_for_dashboard',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.notification_list_for_dashboard
	},
	{
		method: 'GET',
		url: '/dashboard/get_chat_list_profiles',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_chat_list_profiles
	},
	{
		method: 'GET',
		url: '/dashboard/get_chat_messages_list',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_chat_messages_list
	},
	{
		method: 'GET',
		url: '/dashboard/get_user_list_for_popup',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_user_list_for_popup
	},
	{
		method: 'GET',
		url: '/dashboard/get_audio_call_list',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_audio_call_list
	},
	{
		method: 'GET',
		url: '/dashboard/get_video_call_list',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_video_call_list
	},
	{
		method: 'POST',
		url: '/dashboard/update_password',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.update_password
	},
	{
		method: 'POST',
		url: '/dashboard/login',
		//preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.login
	},
	{
		method: 'POST',
		url: '/dashboard/loginwithphone',
		//preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.loginwithphone
	},
	{
		method: 'POST',
		url: '/dashboard/update_group_status',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.update_group_status
	},
	{
		method: 'POST',
		url: '/dashboard/update_product_status',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.update_product_status
	},
	{
		method: 'GET',
		url: '/dashboard/get_product_list_by_shop_id',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_product_list_by_shop_id
	},
	{
		method: 'GET',
		url: '/dashboard/get_product_list',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_product_list
	},
	{
		method: 'GET',
		url: '/dashboard/get_business_list',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_business_list
	},
	{
		method: 'GET',
		url: '/dashboard/get_deleted_posts',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_deleted_posts
	},
	{
		method: 'GET',
		url: '/dashboard/get_group_video_posts',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_group_video_posts
	},
	{
		method: 'GET',
		url: '/dashboard/get_group_media_posts',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_group_media_posts
	},
	{
		method: 'GET',
		url: '/dashboard/get_group_normal_posts',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_group_normal_posts
	},
	{
		method: 'POST',
		url: '/dashboard/update_feed_status',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.update_feed_status
	},
	{
		method: 'POST',
		url: '/dashboard/update_user_status',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.update_user_status
	},
	{
		method: 'POST',
		url: '/dashboard/update_user_status_active',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.update_user_status_active
	},
	{
		method: 'GET',
		url: '/dashboard/get_video_posts',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_video_posts
	},
	{
		method: 'GET',
		url: '/dashboard/get_media_posts',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_media_posts
	},
	{
		method: 'GET',
		url: '/dashboard/get_normal_posts',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_normal_posts
	},
	{
		method: 'GET',
		url: '/dashboard/get_user_group_list',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_user_group_list
	},
	{
		method: 'GET',
		url: '/dashboard/get_user_list_for_user',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_user_list_for_user
	},
	{
		method: 'GET',
		url: '/dashboard/get_suspecious_user_list',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_suspecious_user_list
	},
	{
		method: 'GET',
		url: '/dashboard/get_dashboard_user_list',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_dashboard_user_list
	},
		{
		method: 'GET',
		url: '/dashboard/get_user_data',
		preHandler: middleware_dashboard.authenticateToken,
		handler: adminDashboard.get_user_data
	},
	{
		method: 'GET',
		url: '*',
		//preHandler: middleware_dashboard.authenticateToken,
		handler: invalidRoute.all_get
	},
	{
		method: 'POST',
		url: '*',
		//preHandler: middleware_dashboard.authenticateToken,
		handler: invalidRoute.all_post
	}
]
module.exports = routes;

