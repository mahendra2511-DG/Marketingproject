/* ============================================================
   AXon Marketing Analytics — Capstone, Practice & Interview Prep Hub
   Base project content (M_ constants). Numbers come from mkt-data.js
   (window.MKT), computed from the AXon Retail dataset.
   ============================================================ */
const MKT = window.MKT || {};
const A = MKT.A || {};
const MD = MKT.M || {};
const fmtN = (n) => Number(n).toLocaleString("en-IN");
const fmtUS = (n) => Number(n).toLocaleString("en-US");
const f1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
const f2 = (n) => Number(n).toFixed(2);
const inr = (n) => (n < 0 ? "−" : "") + "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");
const inrL = (n) => (n < 0 ? "−" : "") + "₹" + (Math.abs(Number(n)) / 1e5).toFixed(2) + " L";
const inrCr = (n) => "₹" + (Number(n) / 1e7).toFixed(2) + " Cr";
const mil = (n) => (Number(n) / 1e6).toFixed(2) + "M";
const TT = A.type_table || {};

/* ---------------- KPI REGISTER ----------------
   The 15 KPIs from the project KPI document (email + web) come first,
   then the extended register a real marketing team would add. */
const M_KPIS = [
  // ---- Email dashboard (original KPI document) ----
  { name: "Delivery Rate", cat: "Email Delivery", table: "Activities, Emails",
    desc: "Share of sent emails that reached an inbox (not bounced).",
    definition: "Delivered ÷ emails sent (Recipients). The KPI document writes 'Delivered activities ÷ unique emails', which is a count per email, not a rate.",
    formula: "DIVIDE([Delivered], [Emails Sent])" },
  { name: "Open Rate (Unique)", cat: "Email Engagement", table: "Activities",
    desc: "Share of delivered emails opened at least once.",
    definition: "Distinct (Email_ID, Customer_ID) pairs with an Open ÷ Delivered. The document's 'Open activities ÷ Delivered' counts every repeat open.",
    formula: "DIVIDE([Unique Opens], [Delivered])" },
  { name: "Click-Through Rate (Unique CTR)", cat: "Email Engagement", table: "Activities",
    desc: "Share of delivered emails where the recipient clicked at least once.",
    definition: "Distinct clickers ÷ Delivered. The document's 'Click ÷ Open' (on raw rows) is a click-to-open ratio of activity counts.",
    formula: "DIVIDE([Unique Clicks], [Delivered])" },
  { name: "Campaign Engagement Rate", cat: "Campaign Performance", table: "Activities, Emails, Campaigns",
    desc: "A campaign's share of all email activity.",
    definition: "Activities of the selected campaign ÷ activities of all campaigns (ALL in the denominator).",
    formula: "DIVIDE(COUNTROWS(Activities), CALCULATE(COUNTROWS(Activities), ALL(Campaigns)))" },
  { name: "Top Performing Campaigns", cat: "Campaign Performance", table: "Activities, Campaigns",
    desc: "Campaigns ranked by total activities (document), and by CTR and ROI (better).",
    definition: "Rank campaigns by activity count, then check the ranking again with CTR and ROI: activity volume mostly measures list size.",
    formula: "RANKX(ALL(Campaigns[Campaign_Name]), [Total Activities])" },
  { name: "Avg Activity per Email", cat: "Campaign Performance", table: "Activities, Emails",
    desc: "Average number of activity rows per email send.",
    definition: "Total activities ÷ number of emails (Email_ID).",
    formula: "DIVIDE([Total Activities], DISTINCTCOUNT(Emails[Email_ID]))" },
  { name: "Activity Breakdown by Type", cat: "Email Engagement", table: "Activities",
    desc: "Count and share of Delivered, Open, Click, Bounced, Unsubscribe and Spam Complaint rows.",
    definition: "COUNTROWS(Activities) by Activity_Type, % of the column total.",
    formula: "DIVIDE(COUNTROWS(Activities), CALCULATE(COUNTROWS(Activities), ALL(Activities[Activity_Type])))" },
  { name: "Email Sent vs Activity Timeline", cat: "Campaign Performance", table: "Emails, Activities, Dim_Date",
    desc: "Monthly emails sent (recipients) next to monthly activities.",
    definition: "[Emails Sent] and [Total Activities] on a Dim_Date[Year_Month] axis.",
    formula: "[Emails Sent] and [Total Activities] by Dim_Date[Year_Month]" },
  // ---- Web dashboard (original KPI document) ----
  { name: "Total Unique Visitors", cat: "Web Engagement", table: "Web_Engagement",
    desc: "Visitor volume. The document sums Unique_Visitors.",
    definition: "SUM(Unique_Visitors) double-counts anyone who visits on two days or through two sources, so label it 'visitor-days', or report Sessions.",
    formula: "SUM(Web_Engagement[Unique_Visitors])" },
  { name: "Avg Bounce Rate", cat: "Web Engagement", table: "Web_Engagement",
    desc: "Share of sessions that left after one page.",
    definition: "Bounced sessions ÷ sessions (session-weighted). AVERAGE(Bounce_Rate_Pct) gives every small row the same weight as a big one.",
    formula: "DIVIDE(SUM(Web_Engagement[Bounced_Sessions]), SUM(Web_Engagement[Sessions]))" },
  { name: "Avg Session Duration", cat: "Web Engagement", table: "Web_Engagement",
    desc: "Average minutes per session.",
    definition: "Session-weighted average: Σ(Sessions × duration) ÷ Σ Sessions.",
    formula: "DIVIDE(SUMX(Web_Engagement, Web_Engagement[Sessions] * Web_Engagement[Avg_Session_Duration_Min]), SUM(Web_Engagement[Sessions]))" },
  { name: "Traffic Source Breakdown", cat: "Channel & Device", table: "Web_Engagement",
    desc: "Share of traffic by source.",
    definition: "Sessions by source ÷ all sessions. The document's 'count of rows' gives 12.5% to every source because every source has one row per day × device × region.",
    formula: "DIVIDE(SUM(Web_Engagement[Sessions]), CALCULATE(SUM(Web_Engagement[Sessions]), ALL(Web_Engagement[Traffic_Source])))" },
  { name: "Device Usage Share", cat: "Channel & Device", table: "Web_Engagement",
    desc: "Share of traffic by device.",
    definition: "Sessions by device ÷ all sessions (not a row count, which gives 33.3% each).",
    formula: "DIVIDE(SUM(Web_Engagement[Sessions]), CALCULATE(SUM(Web_Engagement[Sessions]), ALL(Web_Engagement[Device_Type])))" },
  { name: "Top Regions by Unique Visitors", cat: "Channel & Device", table: "Web_Engagement",
    desc: "Regions ranked by visitor volume.",
    definition: "SUM(Unique_Visitors) by Region, ranked. The dataset has 4 regions, so 'Top 5' shows all of them.",
    formula: "RANKX(ALL(Web_Engagement[Region]), [Total Unique Visitors])" },
  { name: "Engagement by Date", cat: "Web Engagement", table: "Web_Engagement, Dim_Date",
    desc: "Sessions, page views and conversions over time.",
    definition: "Sessions by Dim_Date[Year_Month]; watch the missing day 2024-03-12.",
    formula: "SUM(Web_Engagement[Sessions]) by Dim_Date[Year_Month]" },
  // ---- Extended register ----
  { name: "Emails Sent", cat: "Email Delivery", table: "Emails", desc: "Total recipients across all sends.", formula: "SUM(Emails[Recipients])" },
  { name: "Delivered", cat: "Email Delivery", table: "Activities", desc: "Emails that reached the inbox.", formula: "CALCULATE(COUNTROWS(Activities), Activities[Activity_Type] = \"Delivered\")" },
  { name: "Bounce Rate", cat: "Email Delivery", table: "Activities, Emails", desc: "Share of sent emails that bounced (hard + soft).", formula: "DIVIDE(CALCULATE(COUNTROWS(Activities), Activities[Activity_Type] = \"Bounced\"), [Emails Sent])" },
  { name: "Hard Bounces", cat: "Email Delivery", table: "Activities", desc: "Permanent failures (bad address). These must be suppressed.", formula: "CALCULATE(COUNTROWS(Activities), Activities[Bounce_Type] = \"Hard\")" },
  { name: "Human Open Rate", cat: "Email Engagement", table: "Activities", desc: "Unique open rate excluding Apple Mail Privacy Protection machine opens (opens < 15 s after delivery).", formula: "DIVIDE(CALCULATE([Unique Opens], Activities[Is_Machine_Open] = 0), [Delivered])" },
  { name: "Click-to-Open Rate (CTOR)", cat: "Email Engagement", table: "Activities", desc: "Of the people who opened, how many clicked: tests the content, not the subject line.", formula: "DIVIDE([Unique Clicks], [Unique Opens])" },
  { name: "Unsubscribe Rate", cat: "Email Engagement", table: "Activities", desc: "Unsubscribes ÷ delivered.", formula: "DIVIDE(CALCULATE(COUNTROWS(Activities), Activities[Activity_Type] = \"Unsubscribe\"), [Delivered])" },
  { name: "Spam Complaint Rate", cat: "Email Engagement", table: "Activities", desc: "Spam complaints ÷ delivered. Mailbox providers start filtering above ~0.1%.", formula: "DIVIDE(CALCULATE(COUNTROWS(Activities), Activities[Activity_Type] = \"Spam Complaint\"), [Delivered])" },
  { name: "Campaign Spend", cat: "Revenue & ROI", table: "Campaigns", desc: "Money actually spent on the campaigns.", formula: "SUM(Campaigns[Actual_Spend_INR])" },
  { name: "Attributed Revenue", cat: "Revenue & ROI", table: "Orders", desc: "Net revenue of Delivered orders credited to an email (last click within 72 h).", formula: "CALCULATE(SUM(Orders[Net_Revenue_INR]), Orders[Order_Status] = \"Delivered\", NOT ISBLANK(Orders[Attributed_Campaign_ID]))" },
  { name: "Email ROI %", cat: "Revenue & ROI", table: "Orders, Campaigns", desc: "(Attributed revenue − spend) ÷ spend.", formula: "DIVIDE([Attributed Revenue] - [Campaign Spend], [Campaign Spend])" },
  { name: "ROAS", cat: "Revenue & ROI", table: "Orders, Campaigns", desc: "Revenue per ₹1 spent.", formula: "DIVIDE([Attributed Revenue], [Campaign Spend])" },
  { name: "Email Conversion Rate", cat: "Revenue & ROI", table: "Orders, Activities", desc: "Attributed Delivered orders ÷ delivered emails.", formula: "DIVIDE([Attributed Orders], [Delivered])" },
  { name: "Revenue per Email Sent", cat: "Revenue & ROI", table: "Orders, Emails", desc: "Attributed revenue ÷ emails sent.", formula: "DIVIDE([Attributed Revenue], [Emails Sent])" },
  { name: "Net Revenue (Delivered)", cat: "Revenue & ROI", table: "Orders", desc: "All subscriber revenue from Delivered orders.", formula: "CALCULATE(SUM(Orders[Net_Revenue_INR]), Orders[Order_Status] = \"Delivered\")" },
  { name: "Average Order Value", cat: "Revenue & ROI", table: "Orders", desc: "Net revenue ÷ Delivered orders.", formula: "DIVIDE([Net Revenue (Delivered)], CALCULATE(COUNTROWS(Orders), Orders[Order_Status] = \"Delivered\"))" },
  { name: "Return Rate", cat: "Revenue & ROI", table: "Orders", desc: "Returned orders ÷ all orders.", formula: "DIVIDE(CALCULATE(COUNTROWS(Orders), Orders[Order_Status] = \"Returned\"), COUNTROWS(Orders))" },
  { name: "Sessions", cat: "Web Engagement", table: "Web_Engagement", desc: "Total website/app visits.", formula: "SUM(Web_Engagement[Sessions])" },
  { name: "Website Conversion Rate", cat: "Web Engagement", table: "Web_Engagement", desc: "Conversions ÷ sessions.", formula: "DIVIDE(SUM(Web_Engagement[Conversions]), SUM(Web_Engagement[Sessions]))" },
  { name: "Pages per Session", cat: "Web Engagement", table: "Web_Engagement", desc: "Page views ÷ sessions.", formula: "DIVIDE(SUM(Web_Engagement[Page_Views]), SUM(Web_Engagement[Sessions]))" },
  { name: "Paid ROAS (Web)", cat: "Channel & Device", table: "Web_Engagement", desc: "Web revenue ÷ ad spend for paid sources.", formula: "DIVIDE(SUM(Web_Engagement[Revenue_INR]), SUM(Web_Engagement[Ad_Spend_INR]))" },
  { name: "Sessions YoY %", cat: "Web Engagement", table: "Web_Engagement, Dim_Date", desc: "2024 sessions vs 2023.", formula: "DIVIDE([Sessions], CALCULATE([Sessions], SAMEPERIODLASTYEAR(Dim_Date[Date]))) - 1" },
  // ---- Social media: Facebook & Instagram (Social_Ads_Daily, platform-reported) ----
  { name: "Ad Spend (Facebook + Instagram)", cat: "Social Media", table: "Social_Ads_Daily", desc: "Money spent on Meta ads.", formula: "SUM(Social_Ads_Daily[Spend_INR])" },
  { name: "Impressions", cat: "Social Media", table: "Social_Ads_Daily", desc: "Times an ad was shown (one person can see it many times).", formula: "SUM(Social_Ads_Daily[Impressions])" },
  { name: "Reach", cat: "Social Media", table: "Social_Ads_Daily", desc: "Unique people who saw an ad — per row. Not additive across days, cities or formats.", definition: "Ads Manager de-duplicates reach per row. Summing rows counts the same person again, so SUM(Reach) is an upper bound.", formula: "SUM(Social_Ads_Daily[Reach])  -- upper bound only" },
  { name: "Link CTR", cat: "Social Media", table: "Social_Ads_Daily", desc: "Link clicks ÷ impressions.", formula: "DIVIDE(SUM(Social_Ads_Daily[Link_Clicks]), SUM(Social_Ads_Daily[Impressions]))" },
  { name: "CPC (Cost per Click)", cat: "Social Media", table: "Social_Ads_Daily", desc: "Spend ÷ link clicks.", formula: "DIVIDE([Ad Spend (Facebook + Instagram)], SUM(Social_Ads_Daily[Link_Clicks]))" },
  { name: "CPM (Cost per 1,000 Impressions)", cat: "Social Media", table: "Social_Ads_Daily", desc: "Spend ÷ impressions × 1,000.", formula: "DIVIDE([Ad Spend (Facebook + Instagram)], [Impressions]) * 1000" },
  { name: "Engagement Rate (Social)", cat: "Social Media", table: "Social_Ads_Daily", desc: "(Likes + Comments + Shares + Saves) ÷ impressions.", definition: "Total engagements ÷ total impressions. Averaging each row's rate, or dividing by Reach, gives a different number: say which one you report.", formula: "DIVIDE(SUM(Likes) + SUM(Comments) + SUM(Shares) + SUM(Saves), [Impressions])" },
  { name: "Social Conversion Rate", cat: "Social Media", table: "Social_Ads_Daily", desc: "Platform-reported purchases ÷ link clicks.", formula: "DIVIDE(SUM(Social_Ads_Daily[Purchases]), SUM(Social_Ads_Daily[Link_Clicks]))" },
  { name: "Cost per Purchase (CPA)", cat: "Social Media", table: "Social_Ads_Daily", desc: "Spend ÷ platform-reported purchases.", formula: "DIVIDE([Ad Spend (Facebook + Instagram)], SUM(Social_Ads_Daily[Purchases]))" },
  { name: "Social ROAS (platform-reported)", cat: "Social Media", table: "Social_Ads_Daily", desc: "Purchase value reported by Meta ÷ spend.", definition: "Meta counts click-through and view-through purchases, so its numbers are higher than what your own Orders table credits. Never add them to Orders revenue.", formula: "DIVIDE(SUM(Social_Ads_Daily[Purchase_Value_INR]), [Ad Spend (Facebook + Instagram)])" },
  { name: "Ad Profit & Profit %", cat: "Social Media", table: "Social_Ads_Daily", desc: "Gross margin on ad purchases minus ad spend, and as % of purchase value.", formula: "Ad Profit = SUM(Purchase_Gross_Margin_INR) - [Ad Spend]  ·  Profit % = DIVIDE([Ad Profit], SUM(Purchase_Value_INR))" },
  // ---- WhatsApp (WhatsApp_Messages) ----
  { name: "WhatsApp Messages Sent", cat: "WhatsApp", table: "WhatsApp_Messages", desc: "Template messages sent to opted-in customers.", formula: "COUNTROWS(WhatsApp_Messages)" },
  { name: "WhatsApp Delivery Rate", cat: "WhatsApp", table: "WhatsApp_Messages", desc: "Messages that reached the phone ÷ sent.", definition: "Message_Status holds the LAST status, so a read message shows 'Read', not 'Delivered'. Delivered = Delivered + Read.", formula: "DIVIDE(CALCULATE(COUNTROWS(WhatsApp_Messages), WhatsApp_Messages[Message_Status] IN {\"Delivered\", \"Read\"}), [WhatsApp Messages Sent])" },
  { name: "WhatsApp Read Rate", cat: "WhatsApp", table: "WhatsApp_Messages", desc: "Read ÷ delivered.", formula: "DIVIDE(CALCULATE(COUNTROWS(WhatsApp_Messages), WhatsApp_Messages[Message_Status] = \"Read\"), [WA Delivered])" },
  { name: "WhatsApp Click Rate", cat: "WhatsApp", table: "WhatsApp_Messages", desc: "Button clicks ÷ delivered.", formula: "DIVIDE(CALCULATE(COUNTROWS(WhatsApp_Messages), WhatsApp_Messages[Button_Clicked] = \"Yes\"), [WA Delivered])" },
  { name: "WhatsApp Reply Rate", cat: "WhatsApp", table: "WhatsApp_Messages", desc: "Replies ÷ delivered.", formula: "DIVIDE(CALCULATE(COUNTROWS(WhatsApp_Messages), WhatsApp_Messages[Replied] = \"Yes\"), [WA Delivered])" },
  { name: "WhatsApp Opt-out Rate", cat: "WhatsApp", table: "WhatsApp_Messages", desc: "Opt-outs (STOP) ÷ delivered.", formula: "DIVIDE(CALCULATE(COUNTROWS(WhatsApp_Messages), WhatsApp_Messages[Opted_Out] = \"Yes\"), [WA Delivered])" },
  { name: "Cost per Delivered Message", cat: "WhatsApp", table: "WhatsApp_Messages", desc: "Meta conversation charges ÷ delivered messages (failed messages are free).", formula: "DIVIDE(SUM(WhatsApp_Messages[Cost_INR]), [WA Delivered])" },
  { name: "WhatsApp ROI %", cat: "WhatsApp", table: "Orders, Campaigns", desc: "(Delivered orders attributed to WhatsApp − spend) ÷ spend.", formula: "DIVIDE([WA Attributed Revenue] - [WA Spend], [WA Spend])" },
  // ---- Channel comparison & profit ----
  { name: "Spend by Channel", cat: "Channel & Profit", table: "Campaigns", desc: "Actual spend for Email, Facebook, Instagram and WhatsApp campaigns.", formula: "SUM(Campaigns[Actual_Spend_INR]) by Campaigns[Channel]" },
  { name: "ROAS by Channel", cat: "Channel & Profit", table: "Orders, Social_Ads_Daily, Campaigns", desc: "Revenue ÷ spend per channel. Email & WhatsApp from Orders (last click), Facebook & Instagram from Meta (platform-reported).", definition: "Two different attribution sources: label them, don't rank them as if they were measured the same way.", formula: "DIVIDE([Channel Revenue], [Channel Spend])" },
  { name: "Gross Margin %", cat: "Channel & Profit", table: "Orders", desc: "(Net revenue − product cost) ÷ net revenue, Delivered orders.", formula: "DIVIDE([Net Revenue (Delivered)] - CALCULATE(SUM(Orders[Product_Cost_INR]), Orders[Order_Status] = \"Delivered\"), [Net Revenue (Delivered)])" },
  { name: "Total Marketing Spend", cat: "Channel & Profit", table: "Campaigns, Web_Engagement", desc: "All campaign spend plus Google Ads spend from web data.", formula: "SUM(Campaigns[Actual_Spend_INR]) + CALCULATE(SUM(Web_Engagement[Ad_Spend_INR]), Web_Engagement[Traffic_Source] = \"Google Ads\")" },
];
const M_KPI_CATS = ["All", "Email Delivery", "Email Engagement", "Campaign Performance", "Revenue & ROI", "Social Media", "WhatsApp", "Channel & Profit", "Web Engagement", "Channel & Device"];

/* ---------------- MODEL ---------------- */
const M_RELATIONSHIPS = [
  "Campaigns → Emails  (Campaign_ID, 1:Many) — Email campaigns only",
  "Campaigns → Social_Ads_Daily  (Campaign_ID, 1:Many) — Facebook & Instagram campaigns",
  "Campaigns → WhatsApp_Messages  (Campaign_ID, 1:Many) — WhatsApp campaigns",
  "Emails → Activities  (Email_ID, 1:Many)",
  "Customers → Activities / WhatsApp_Messages / Orders  (Customer_ID, 1:Many)",
  "Campaigns → Orders  (Campaign_ID = Attributed_Campaign_ID, 1:Many) — attribution",
  "Emails → Orders (Attributed_Email_ID) and WhatsApp_Messages → Orders (Attributed_Message_ID) — inactive, used for touch-level drill-down",
  "Dim_Date → every fact  (Date = DATE(event time), 1:Many): Emails, Activities, WhatsApp_Messages, Social_Ads_Daily, Orders, Web_Engagement",
  "Web_Engagement has no customer or campaign key: it describes ALL site traffic. It meets Social_Ads_Daily only on Date + Platform (= Traffic_Source) + Device + Region for spend reconciliation",
];
const M_LOAD_ORDER = [
  "1. Dim_Date — 762 days (2023-01-01 → 2025-01-31, Is_Reporting_Period = 2023–2024)",
  "2. Campaigns — 103 campaigns (61 Email · 14 Facebook · 14 Instagram · 14 WhatsApp)",
  "3. Customers — 12,000 subscribers",
  "4. Emails — 471 sends",
  "5. Activities — 313,895 email events (use LOAD DATA, not the import wizard)",
  "6. WhatsApp_Messages — 73,221 messages",
  "7. Social_Ads_Daily — 41,736 rows (date × campaign × ad format × city × device)",
  "8. Orders — 47,604 orders with last-click Email/WhatsApp attribution",
  "9. Web_Engagement — 70,080 rows (date × 8 sources × 3 devices × 4 regions)",
];
const M_CALC_FIELDS = [
  "Activity_Day (Activities) — DATE(Activity_Date): the key to Dim_Date, because Activity_Date carries a time",
  "Is_Machine_Open (Activities) — 1 when an Open happens < 15 seconds after the same recipient's Delivered row (Apple Mail Privacy Protection)",
  "Is_Delivered (WhatsApp_Messages) — Message_Status IN ('Delivered','Read'): status is the LAST state, so Read messages were delivered too",
  "Sent_Day (WhatsApp_Messages) — DATE(Sent_Time) for the Dim_Date relationship",
  "Engagements (Social_Ads_Daily) — Likes + Comments + Shares + Saves",
  "Send_Time_Band (Emails) — Morning 8–11 / Afternoon 12–16 / Evening 17–21 from HOUR(Email_Sent_Date)",
  "Campaign_Status (Campaigns) — 'Always-on' when End_Date IS NULL, else 'Closed'",
  "Gross_Profit (Orders) — Net_Revenue_INR − Product_Cost_INR",
];
const M_GOTCHAS = [
  { t: "The KPI document's Delivery Rate is not a rate", d: `'Delivered activities ÷ unique emails' = ${fmtN(A.delivered)} ÷ ${A.emails} = ${A.doc_delivery}. That's delivered recipients per email send. A rate needs the same unit on top and bottom: Delivered ÷ Recipients = ${A.delivery_rate}%.` },
  { t: "Opens ≠ openers", d: `There are ${fmtN(A.opens)} Open rows but only ${fmtN(A.unique_opens)} distinct (email, customer) pairs: people open the same email again. Open rows ÷ Delivered = ${A.total_open_rate}%, unique open rate = ${A.unique_open_rate}%.` },
  { t: "Apple Mail opens are machines", d: `${f1(A.machine_open_share)}% of Open rows arrive 1–9 seconds after delivery: Apple Mail Privacy Protection pre-loads the email. Apple Mail users show ${MD.open_by_client ? MD.open_by_client[0][1] : 82.9}% raw open rate but ${MD.human_open_by_client ? MD.human_open_by_client[0][1] : 32.3}% human. Report the human open rate (${A.human_open_rate}%) next to the raw one.` },
  { t: "CTR has three definitions", d: `Click rows ÷ Open rows = ${A.doc_ctr}% (document). Unique clickers ÷ delivered = ${A.unique_ctr}% (CTR). Unique clickers ÷ unique openers = ${A.ctor}% (CTOR). Name the one you use on the card.` },
  { t: "Don't sum Unique_Visitors", d: `SUM(Unique_Visitors) = ${fmtN(A.uv_sum)} 'visitors', but the same person visiting on two days is counted twice. It's visitor-days. Use Sessions (${fmtN(A.sessions)}) as the volume measure, or label it honestly.` },
  { t: "Don't average a rate column", d: `AVERAGE(Bounce_Rate_Pct) = ${A.bounce_avg}% but the true session-weighted bounce rate is ${A.bounce_weighted}%. Small rows (Tablet, East) get the same weight as big ones in a plain average. Same for duration: ${A.dur_avg} vs ${A.dur_weighted} min.` },
  { t: "Counting rows gives 12.5% to every source", d: "The document says 'count of rows' for Traffic Source Breakdown. Every source has exactly one row per day × device × region, so each of the 8 sources gets 1/8 = 12.5%. Sum Sessions instead: Organic Search 30.6%, Google Ads 23.2% … WhatsApp 1.7%." },
  { t: "Revenue = Delivered orders only", d: `All attributed orders = ${inr(A.attr_rev_all_status)}, but returned and cancelled orders are not revenue. Delivered only = ${inr(A.attr_rev)}. ROI changes from ${f1((A.attr_rev_all_status - A.spend) / A.spend * 100)}% to ${A.roi}%.` },
  { t: "WhatsApp 'Delivered' hides the read messages", d: `Message_Status is the LAST status. Counting only 'Delivered' rows gives ${fmtN(A.wa ? A.wa.delivered_status_only : 0)} (${A.wa ? A.wa.wrong_delivery_rate : 0}% delivery rate); every 'Read' message was delivered too, so Delivered = Delivered + Read = ${fmtN(A.wa ? A.wa.delivered : 0)} (${A.wa ? A.wa.delivery_rate : 0}%).` },
  { t: "Reach is not additive", d: `Each Social_Ads_Daily row has its own de-duplicated Reach. Summing rows gives ${mil(A.social ? A.social.reach : 0)}, but the same person seen in Mumbai on Monday and Tuesday is counted twice. Report Impressions and frequency per campaign, and treat summed reach as an upper bound.` },
  { t: "Platform-reported ≠ your orders", d: `Meta reports ${fmtN(A.social ? A.social.purchases : 0)} purchases worth ${inrCr(A.social ? A.social.value : 0)}, including view-through conversions. Those orders are not in the Orders table (which is subscriber orders with Email/WhatsApp attribution). Show the source next to every channel ROAS and never add the two revenues together.` },
  { t: "Instagram looks great on engagement, not on profit", d: `Instagram's engagement rate is ${A.social_platform ? A.social_platform.Instagram.er : 0}% vs Facebook's ${A.social_platform ? A.social_platform.Facebook.er : 0}%, but its ROAS is ${A.social_platform ? A.social_platform.Instagram.roas : 0} vs ${A.social_platform ? A.social_platform.Facebook.roas : 0} and its ad profit is negative after product cost. Likes are not revenue.` },
];
const M_JOIN_PATHS = [
  ["Emails by campaign", "Emails[Campaign_ID] = Campaigns[Campaign_ID]"],
  ["Activities by email / campaign", "Activities[Email_ID] = Emails[Email_ID] → Emails[Campaign_ID] = Campaigns[Campaign_ID]"],
  ["Activities / WhatsApp by customer", "Activities[Customer_ID] = Customers[Customer_ID]; WhatsApp_Messages[Customer_ID] = Customers[Customer_ID]"],
  ["Social ads by campaign", "Social_Ads_Daily[Campaign_ID] = Campaigns[Campaign_ID] (Platform = Channel)"],
  ["WhatsApp by campaign", "WhatsApp_Messages[Campaign_ID] = Campaigns[Campaign_ID]"],
  ["Machine-open flag", "Open row JOIN Delivered row ON same Email_ID AND Customer_ID; TIMESTAMPDIFF(SECOND, delivered, open) < 15"],
  ["Campaign revenue / ROI", "Orders[Attributed_Campaign_ID] = Campaigns[Campaign_ID] AND Orders[Order_Status] = 'Delivered'"],
  ["Touch-level drill-down", "Orders[Attributed_Email_ID] = Emails[Email_ID]; Orders[Attributed_Message_ID] = WhatsApp_Messages[Message_ID]"],
  ["Ad spend reconciliation", "Social_Ads_Daily (Date, Platform, Device_Type, Region) = Web_Engagement (Date, Traffic_Source, Device_Type, Region)"],
  ["Trend over time", "DATE(any event time) = Dim_Date[Date]"],
];
const M_GLOBAL_FILTERS = [
  ["Date Range", "Dim_Date.Date"], ["Year / Month", "Dim_Date.Year, Dim_Date.Year_Month"], ["Festive Season", "Dim_Date.Festive_Season"],
  ["Channel", "Campaigns.Channel (Email / Facebook / Instagram / WhatsApp)"], ["Campaign Type", "Campaigns.Campaign_Type"], ["Campaign", "Campaigns.Campaign_Name"],
  ["Ad Format (social page)", "Social_Ads_Daily.Ad_Format"], ["City (social page)", "Social_Ads_Daily.City"], ["Device", "Social_Ads_Daily.Device_Type / Web_Engagement.Device_Type"],
  ["Loyalty Tier", "Customers.Loyalty_Tier"], ["Email Client", "Customers.Email_Client"], ["Traffic Source (web page)", "Web_Engagement.Traffic_Source"], ["Region", "Customers.Region / Web_Engagement.Region"],
];
const M_DASHBOARDS = [
  ["1", "Email Campaign Performance", "CMO, CRM / Email Marketing Manager", "Emails Sent, Delivery Rate, Unique & Human Open Rate, CTR, CTOR, Unsubscribe Rate, ROI", "KPI cards, Activity breakdown donut, Sent vs Activity timeline, Top campaigns, ROI by campaign type"],
  ["2", "Social & WhatsApp Performance", "CMO, Social Media Manager, CRM", "Ad Spend, Impressions, CTR, CPC, Engagement Rate, ROAS, Profit %; WhatsApp Delivery, Read, Click, ROI", "Platform cards (Facebook / Instagram), ROAS by campaign type, ad-format comparison, city table, WhatsApp funnel"],
  ["3", "Web Engagement", "Digital Marketing / Growth Manager", "Sessions, Unique Visitors, Bounce Rate (weighted), Avg Session Duration, Conversion Rate", "KPI cards, Traffic source share, Device share, Region ranking, Monthly trend"],
];

/* ---------------- DATA DICTIONARY ---------------- */
const M_DATA_DICTIONARY = [
  { table: "Campaigns", rows: "103 rows", cols: [
    ["Campaign_ID", "Text", "Unique campaign key (PK)", "CAMP-0001 … CAMP-0103"], ["Campaign_Name", "Text", "Campaign name", "FB – / IG – / WA – prefixes for social and WhatsApp"],
    ["Channel", "Text", "Email / Facebook / Instagram / WhatsApp", "Decides which fact table holds the campaign's events"],
    ["Campaign_Type", "Text", "Newsletter, Promotional, Festive, Product Launch, Re-engagement, Loyalty, Welcome, Cart Abandonment, Acquisition, Retargeting, Awareness, Influencer", "—"],
    ["Objective", "Text", "Awareness / Engagement / Conversion / Retention / Reactivation", "—"], ["Target_Segment", "Text", "Planned audience", "Lookalike, retargeting, opt-in segments for social / WhatsApp"],
    ["Product_Category", "Text", "Category promoted", "'Mixed' = whole catalogue"], ["Start_Date", "Date", "Campaign start", "—"], ["End_Date", "Date", "Campaign end", "NULL for 2 always-on email programmes"],
    ["Budget_INR", "Integer", "Approved budget (₹)", "—"], ["Actual_Spend_INR", "Integer", "Money actually spent (₹)", "Social = SUM of daily ad spend; WhatsApp = message cost + creative"],
    ["Discount_Offer_Pct", "Integer", "Headline discount %", "—"], ["Campaign_Manager", "Text", "Owner", "—"],
    ["UTM_Source", "Text", "email / facebook / instagram / whatsapp", "Matches the tracking links"], ["UTM_Campaign", "Text", "Tracking code, e.g. em_diwali-mega-sale-2024", "—"]] },
  { table: "Emails", rows: "471 rows", cols: [
    ["Email_ID", "Text", "Unique send key (PK)", "EMAIL-00001 …"], ["Campaign_ID", "Text", "FK → Campaigns (Channel = Email)", "—"],
    ["Email_Subject", "Text", "Subject line", "{{FirstName}} = personalisation token"], ["Email_Sent_Date", "DateTime", "Send timestamp", "Always inside the campaign's dates"],
    ["Email_Sequence", "Integer", "Position in the campaign (1, 2, 3 …)", "—"], ["AB_Variant", "Text", "A / B subject test", "Blank when no test (441 rows)"],
    ["Audience_Segment", "Text", "Segment sent to", "—"], ["Recipients", "Integer", "Addresses sent to", `= Delivered + Bounced rows for the email; total ${fmtN(A.sent)}`],
    ["Is_Personalised_Subject", "Yes/No", "Subject has {{FirstName}}", "—"], ["Subject_Length", "Integer", "Characters", "—"]] },
  { table: "Activities", rows: "313,895 rows", cols: [
    ["Activity_ID", "Text", "Unique event key (PK)", "ACT-0000001 …"], ["Email_ID", "Text", "FK → Emails", "—"], ["Customer_ID", "Text", "FK → Customers", "—"],
    ["Activity_Type", "Text", "Delivered, Bounced, Open, Click, Unsubscribe, Spam Complaint", "Repeat Open/Click rows per recipient are normal"],
    ["Activity_Date", "DateTime", "Event timestamp", "Never before the send; late opens run into Jan 2025 (covered by Dim_Date)"],
    ["Bounce_Type", "Text", "Hard / Soft", "Only on Bounced rows"], ["Link_Name", "Text", "Link clicked", "Only on Click rows"], ["Device_Type", "Text", "Mobile / Desktop / Tablet", "Only on Open and Click rows"]] },
  { table: "WhatsApp_Messages", rows: "73,221 rows", cols: [
    ["Message_ID", "Text", "Unique message key (PK)", "WA-0000001 …"], ["Campaign_ID", "Text", "FK → Campaigns (Channel = WhatsApp)", "—"], ["Customer_ID", "Text", "FK → Customers", "Only opted-in customers"],
    ["Template_Name", "Text", "Approved template used", "e.g. diwali_countdown_d7"], ["Sent_Time", "DateTime", "Sent by our system", "—"],
    ["Message_Status", "Text", "Read / Delivered / Failed", "LAST status: a Read message was also delivered"], ["Failure_Reason", "Text", "Why it failed", "Only on Failed rows"],
    ["Delivered_Time", "DateTime", "Reached the phone", "NULL when Failed"], ["Read_Time", "DateTime", "Blue ticks", "NULL when not read (or read receipts off)"],
    ["Button_Clicked", "Yes/No", "Clicked the CTA button", "—"], ["Click_Time", "DateTime", "Click timestamp", "Used for attribution"], ["Replied", "Yes/No", "Customer replied", "—"],
    ["Opted_Out", "Yes/No", "Replied STOP / blocked", "Customer is not messaged again"], ["Cost_INR", "Decimal", "Meta marketing conversation charge", "₹0.73 (2023) / ₹0.78 (2024); 0 when Failed"]] },
  { table: "Social_Ads_Daily", rows: "41,736 rows", cols: [
    ["Ad_Row_ID", "Text", "Row key (PK)", "SOC-000001 …"], ["Date", "Date", "Day", "—"], ["Campaign_ID", "Text", "FK → Campaigns (Facebook / Instagram)", "—"],
    ["Platform", "Text", "Facebook / Instagram", "= Campaigns.Channel"], ["Ad_Format", "Text", "Image, Carousel, Video, Collection, Reel, Story", "Reels & Stories only on Instagram"],
    ["City", "Text", "Targeted city (8 metros)", "—"], ["Region", "Text", "Region of the city", "Matches Web_Engagement.Region"], ["Device_Type", "Text", "Mobile / Desktop", "—"],
    ["Impressions", "Integer", "Times shown", "—"], ["Reach", "Integer", "Unique people in this row", "Not additive across rows"], ["Link_Clicks", "Integer", "Clicks to the site", "—"],
    ["Landing_Page_Views", "Integer", "Clicks where the page loaded", "≈ 78% of clicks"], ["Add_To_Cart", "Integer", "Add-to-cart events (pixel)", "—"],
    ["Likes", "Integer", "Reactions", "—"], ["Comments", "Integer", "Comments", "—"], ["Shares", "Integer", "Shares", "—"], ["Saves", "Integer", "Saves", "High on Instagram"],
    ["Video_Views_3s", "Integer", "3-second video views", "0 for Image/Carousel/Collection"], ["Spend_INR", "Decimal", "Ad spend (₹)", "SUM by Date × Platform × Device × Region = Web_Engagement.Ad_Spend_INR"],
    ["Purchases", "Integer", "Purchases reported by Meta", "Includes view-through; not in Orders"], ["Purchase_Value_INR", "Decimal", "Value of those purchases", "Platform-reported"],
    ["Purchase_Gross_Margin_INR", "Decimal", "Product margin on those purchases", "Profit = margin − spend"]] },
  { table: "Customers", rows: "12,000 rows", cols: [
    ["Customer_ID", "Text", "Subscriber key (PK)", "CUST-000001 …"], ["Signup_Date", "Date", "Joined AXon", "Some before 2023"], ["City", "Text", "City", "Indian cities"],
    ["State", "Text", "State", "—"], ["Region", "Text", "North / South / East / West", "—"], ["City_Tier", "Text", "Tier 1 / 2 / 3", "—"], ["Age_Band", "Text", "Age group", "—"], ["Gender", "Text", "Female / Male / Other", "—"],
    ["Preferred_Language", "Text", "Language for communication", "—"], ["Acquisition_Channel", "Text", "First touch channel", "—"], ["Email_Client", "Text", "Gmail / Apple Mail / Outlook / Other", "Apple Mail = machine opens"],
    ["Loyalty_Tier", "Text", "Bronze / Silver / Gold / Platinum", "—"], ["Email_Opt_In", "Yes/No", "Currently subscribed to email", `${fmtN(A.opt_in_yes)} Yes`], ["Unsubscribe_Date", "DateTime", "Email unsubscribe", "NULL if subscribed"],
    ["WhatsApp_Opt_In", "Yes/No", "Currently opted in to WhatsApp", `${fmtN(A.wa ? A.wa.opted_in : 0)} Yes`], ["WhatsApp_Opt_In_Date", "Date", "Consent date", "No message is sent before it"], ["WhatsApp_Opt_Out_Date", "Date", "Opt-out date", "NULL if still opted in"]] },
  { table: "Orders", rows: "47,604 rows", cols: [
    ["Order_ID", "Text", "Order key (PK)", "—"], ["Customer_ID", "Text", "FK → Customers", "—"], ["Order_Date", "DateTime", "Order timestamp", "—"],
    ["Product_Category", "Text", "5 categories", "—"], ["Units", "Integer", "Units", "—"], ["Gross_Amount_INR", "Decimal", "Before discount (₹)", "—"], ["Discount_INR", "Decimal", "Discount (₹)", "—"],
    ["Net_Revenue_INR", "Decimal", "Gross − Discount (₹)", "Revenue counts Delivered only"], ["Product_Cost_INR", "Decimal", "Cost of goods (₹)", "Gross profit = Net − Cost"], ["Coupon_Code", "Text", "Coupon used", "NULL when no discount"],
    ["Order_Channel", "Text", "Website / Mobile App", "—"], ["Payment_Mode", "Text", "UPI / Card / COD …", "—"], ["Order_Status", "Text", "Delivered / Returned / Cancelled", `${A.return_rate}% returned, ${A.cancel_rate}% cancelled`],
    ["Attributed_Channel", "Text", "Email / WhatsApp / Not attributed", "Last click within 72 h"], ["Attributed_Campaign_ID", "Text", "FK → Campaigns", "NULL when not attributed"],
    ["Attributed_Email_ID", "Text", "FK → Emails", "Filled only for Email"], ["Attributed_Message_ID", "Text", "FK → WhatsApp_Messages", "Filled only for WhatsApp"]] },
  { table: "Web_Engagement", rows: "70,080 rows", cols: [
    ["Date", "Date", "Day", "2024-03-12 missing (tracking outage)"], ["Traffic_Source", "Text", "Organic Search, Google Ads, Facebook, Instagram, WhatsApp, Email, Direct, Referral", "8 sources"], ["Device_Type", "Text", "Mobile / Desktop / Tablet", "—"], ["Region", "Text", "4 regions", "—"],
    ["Sessions", "Integer", "Visits", "The weight for every rate"], ["Unique_Visitors", "Integer", "Distinct visitors in this row", "Not additive across rows"], ["New_Visitors", "Integer", "First-time visitors", "—"],
    ["Page_Views", "Integer", "Pages viewed", "—"], ["Bounced_Sessions", "Integer", "Single-page sessions", "—"], ["Bounce_Rate_Pct", "Decimal", "Row-level bounce %", "Don't AVERAGE: weight by Sessions"],
    ["Avg_Session_Duration_Min", "Decimal", "Row-level average minutes", "Weight by Sessions"], ["Conversions", "Integer", "Purchases (all visitors)", "—"], ["Revenue_INR", "Decimal", "Web revenue (₹)", "All visitors, not just subscribers"],
    ["Ad_Spend_INR", "Decimal", "Media spend", "Google Ads, Facebook, Instagram; Facebook/Instagram = Social_Ads_Daily spend"]] },
  { table: "Dim_Date", rows: "762 rows", cols: [
    ["Date", "Date", "PK, every day 2023-01-01 → 2025-01-31", "Covers every event date"], ["Year", "Integer", "—", "—"], ["Quarter", "Text", "Q1–Q4", "—"], ["Month_Num", "Integer", "—", "Sort Month_Name by this"], ["Month_Name", "Text", "Jan…Dec", "—"],
    ["Year_Month", "Text", "yyyy-mm", "Use on trend axes"], ["Week_Num", "Integer", "ISO week", "1–3 Jan can be week 52/53"], ["Day_Name", "Text", "—", "—"], ["Is_Weekend", "Yes/No", "Sat or Sun", "—"],
    ["Fiscal_Year", "Text", "Apr–Mar", "—"], ["Festive_Season", "Yes/No", "Diwali window", "2023-11-12 and 2024-11-01 ± days"], ["Is_Reporting_Period", "Yes/No", "2023–2024", "Filter = Yes for annual KPIs"]] },
];

/* ---------------- SQL (for QA_SQL) ---------------- */
const M_SQL_BLOCKS = [
  { title: "1 · Data Count Validation", desc: "Every table's row count must match the Dataset page before you build anything.",
    sql: "SELECT 'Campaigns' t, COUNT(*) n FROM campaigns              -- 103\nUNION ALL SELECT 'Emails', COUNT(*) FROM emails                -- 471\nUNION ALL SELECT 'Activities', COUNT(*) FROM activities        -- 313,895\nUNION ALL SELECT 'WhatsApp_Messages', COUNT(*) FROM whatsapp_messages  -- 73,221\nUNION ALL SELECT 'Social_Ads_Daily', COUNT(*) FROM social_ads_daily    -- 41,736\nUNION ALL SELECT 'Customers', COUNT(*) FROM customers          -- 12,000\nUNION ALL SELECT 'Orders', COUNT(*) FROM orders                -- 47,604\nUNION ALL SELECT 'Web_Engagement', COUNT(*) FROM web_engagement  -- 70,080\nUNION ALL SELECT 'Dim_Date', COUNT(*) FROM dim_date;           -- 762" },
  { title: "2 · Referential integrity (every FK)", desc: "Orphans break every campaign-level number. All of these return 0 on this dataset.",
    sql: "SELECT COUNT(*) FROM emails e LEFT JOIN campaigns c ON c.campaign_id = e.campaign_id WHERE c.campaign_id IS NULL;                -- 0\nSELECT COUNT(*) FROM activities a LEFT JOIN emails e ON e.email_id = a.email_id WHERE e.email_id IS NULL;                      -- 0\nSELECT COUNT(*) FROM activities a LEFT JOIN customers c ON c.customer_id = a.customer_id WHERE c.customer_id IS NULL;           -- 0\nSELECT COUNT(*) FROM whatsapp_messages w LEFT JOIN campaigns c ON c.campaign_id = w.campaign_id AND c.channel = 'WhatsApp'\nWHERE c.campaign_id IS NULL;                                                                                                   -- 0\nSELECT COUNT(*) FROM whatsapp_messages w LEFT JOIN customers c ON c.customer_id = w.customer_id WHERE c.customer_id IS NULL;     -- 0\nSELECT COUNT(*) FROM social_ads_daily s LEFT JOIN campaigns c ON c.campaign_id = s.campaign_id AND c.channel = s.platform\nWHERE c.campaign_id IS NULL;                                                                                                   -- 0\nSELECT COUNT(*) FROM orders o LEFT JOIN campaigns c ON c.campaign_id = o.attributed_campaign_id\nWHERE o.attributed_campaign_id IS NOT NULL AND c.campaign_id IS NULL;                                                          -- 0\nSELECT COUNT(*) FROM orders o LEFT JOIN whatsapp_messages w ON w.message_id = o.attributed_message_id\nWHERE o.attributed_message_id IS NOT NULL AND w.message_id IS NULL;                                                            -- 0\n-- every event date exists in dim_date\nSELECT COUNT(*) FROM activities a LEFT JOIN dim_date d ON d.date = DATE(a.activity_date) WHERE d.date IS NULL;                 -- 0" },
  { title: "3 · Date logic", desc: "Events can't happen before the send, and sends / ads must fall inside the campaign window.",
    sql: "SELECT COUNT(*) FROM activities a JOIN emails e ON e.email_id = a.email_id\nWHERE a.activity_date < e.email_sent_date;                       -- 0\n\nSELECT COUNT(*) FROM emails e JOIN campaigns c ON c.campaign_id = e.campaign_id\nWHERE e.email_sent_date < c.start_date\n   OR (c.end_date IS NOT NULL AND DATE(e.email_sent_date) > c.end_date);   -- 0\n\nSELECT COUNT(*) FROM social_ads_daily s JOIN campaigns c ON c.campaign_id = s.campaign_id\nWHERE s.date NOT BETWEEN c.start_date AND c.end_date;                    -- 0\n\nSELECT COUNT(*) FROM whatsapp_messages\nWHERE read_time < delivered_time OR click_time < read_time;              -- 0" },
  { title: "4 · Reconciliations across tables", desc: "Recipients = Delivered + Bounced; campaign spend = daily ad spend; ad spend matches the web table.",
    sql: "SELECT SUM(recipients) FROM emails;                                         -- 177,032\nSELECT SUM(activity_type IN ('Delivered','Bounced')) FROM activities;      -- 177,032\n\n-- campaign spend vs daily ad rows (0 differences)\nSELECT c.campaign_id, c.actual_spend_inr, ROUND(SUM(s.spend_inr)) AS daily_total\nFROM campaigns c JOIN social_ads_daily s ON s.campaign_id = c.campaign_id\nGROUP BY c.campaign_id, c.actual_spend_inr\nHAVING ABS(c.actual_spend_inr - ROUND(SUM(s.spend_inr))) > 1;\n\n-- Meta spend vs web ad spend by day: only 2024-03-12 differs (web tracking outage)\nSELECT s.date, s.platform, ROUND(SUM(s.spend_inr)) meta, ROUND(COALESCE(w.sp, 0)) web\nFROM social_ads_daily s\nLEFT JOIN (SELECT date, traffic_source, SUM(ad_spend_inr) sp FROM web_engagement GROUP BY 1, 2) w\n       ON w.date = s.date AND w.traffic_source = s.platform\nGROUP BY s.date, s.platform, w.sp HAVING ABS(meta - web) > 2;" },
  { title: "5 · List hygiene: sends after unsubscribe and repeat hard bounces", desc: "Real compliance issues hidden in the data. Report them, don't delete them.",
    sql: "-- emails delivered to a customer AFTER they unsubscribed\nSELECT COUNT(*) FROM activities a JOIN customers c ON c.customer_id = a.customer_id\nWHERE a.activity_type = 'Delivered' AND c.unsubscribe_date IS NOT NULL\n  AND a.activity_date > c.unsubscribe_date;                         -- 104\n\n-- customers who hard-bounced more than once (address not suppressed)\nSELECT COUNT(*) FROM (\n  SELECT customer_id FROM activities WHERE bounce_type = 'Hard'\n  GROUP BY customer_id HAVING COUNT(*) > 1) x;                      -- 33 (of 145 hard-bounced customers)\n\n-- WhatsApp sent only after consent\nSELECT COUNT(*) FROM whatsapp_messages w JOIN customers c ON c.customer_id = w.customer_id\nWHERE w.sent_time < c.whatsapp_opt_in_date;                         -- 0" },
];

/* ---------------- PROBLEM ---------------- */
const M_PROBLEM_STATEMENT = [
  { icon: "1", h: "Engagement numbers nobody trusts", p: `The team reports a ${A.total_open_rate}% open rate because it counts every Open row. Repeat opens and Apple Mail's automatic opens hide a real (human) open rate of about ${Math.round(A.human_open_rate)}%.` },
  { icon: "2", h: "Spend without measured return", p: `${inrCr(A.total_campaign_spend || 0)} went into ${A.campaigns_all || 103} campaigns across Email, Facebook, Instagram and WhatsApp, but no one compares ROI by channel. ${A.neg_roi_campaigns} email campaigns and ${A.soc_campaigns_below_1 || 0} social campaigns earn less than they cost.` },
  { icon: "3", h: "Social judged on likes", p: `Instagram gets the most likes and saves, so it looks like the star channel. After spend and product cost it loses money (ROAS ${A.social_platform ? A.social_platform.Instagram.roas : 0}).` },
  { icon: "4", h: "Web metrics added up the wrong way", p: "Unique visitors are summed across days, bounce rates are averaged across rows and traffic sources are counted by rows, so every source looks equally important." },
  { icon: "5", h: "List hygiene and compliance gaps", p: `${A.sends_after_unsub} emails went to people after they unsubscribed and ${A.repeat_hard_bounce_customers} hard-bounced addresses were mailed again: a deliverability and legal risk.` },
  { icon: "6", h: "No single view of the funnel", p: "Campaign plans, email events, WhatsApp messages, Meta ad reports, orders and website traffic sit in separate exports, so nobody can follow a campaign from spend to revenue." },
];

/* ---------------- TOOLS / DOMAIN ---------------- */
const M_TOOLS = [
  { logo: "assets/excel-logo.jpg", name: "Excel", role: "Stage 1 · KPIs in Excel", desc: "Open the workbook, understand the 3 email tables and the web table, and build the 15 KPI-document KPIs with formulas and pivots. The starter shows where the document's formulas go wrong." },
  { logo: "assets/mysql-logo.png", name: "SQL (MySQL)", role: "Stage 2 · Load it into a database", desc: "Load all 9 tables into MySQL, validate them, and build the vw_email_performance and vw_campaign_roi views that both BI tools read." },
  { logo: "assets/tableau-logo.jpg", name: "Tableau", role: "Stage 3 · Tableau–SQL", desc: "Connect Tableau to MySQL (not to the Excel file) and build the Email and Web dashboards." },
  { logo: "assets/powerbi-logo.png", name: "Power BI", role: "Stage 4 · Power BI–SQL", desc: "Connect Power BI to the same MySQL source, model the star schema around Dim_Date, and write the DAX measures from the KPI Library." },
  { logo: "assets/sia-avatar.png", name: "AI / Insights", role: "Optional · Ask the data a question", desc: "A Q&A visual or Copilot on top of the same model, so a manager can type 'which campaign type has the best ROI?' and get the governed answer." },
  { logo: "assets/mysql-logo.png", name: "QA / SQL", role: "Stage 5 · Match backend to dashboard", desc: "Run SQL against the database and reconcile Delivery Rate, Open Rate, CTR, ROI, Sessions and Bounce Rate with what Tableau and Power BI show." },
];
const M_DOMAIN_WHAT = "Marketing analytics measures what each rupee and each message actually achieves. For email it follows the funnel: sent → delivered → opened → clicked → bought, plus the negative signals (bounces, unsubscribes, spam complaints). For the website it measures traffic, engagement and conversion by source and device. Done well, it tells a CMO which campaigns to repeat, which to stop, and which channel deserves the next rupee; done badly (summing rates, counting repeat opens) it flatters every campaign.";
const M_DOMAIN_WHERE = [
  "E-commerce and retail brands — email and SMS campaigns, cart-abandonment flows, festive sales, loyalty programmes.",
  "Digital marketing teams — channel mix (organic, paid, social, email), cost per acquisition and ROAS.",
  "CRM and lifecycle marketing — welcome series, re-engagement and churn, list health and deliverability.",
  "Growth and product teams — website funnels, device experience, conversion-rate optimisation and A/B tests.",
];
const M_DOMAIN_DATA_TYPES = ["Campaign plans & budgets", "Email sends & events", "WhatsApp messages (sent, read, clicked)", "Facebook & Instagram ad reports", "Likes, comments, shares, saves", "Unsubscribes, opt-outs & spam complaints", "Subscriber profiles & consent", "Orders, coupons & attribution", "Website sessions by source & device", "Ad spend", "Calendar & festive seasons"];
const M_FLOW = [
  { t: "Data Preparation", d: "Open Marketing Data (Excel). Understand Campaigns → Emails → Activities and the web table; build the KPI-document KPIs in Excel." },
  { t: "SQL Integration", d: "Load the 7 tables into MySQL with keys; run the count, integrity and date checks; build vw_email_performance and vw_campaign_roi." },
  { t: "BI Tool Connection", d: "Connect Tableau and Power BI to MySQL; relate every table to Dim_Date; add Is_Machine_Open and the DAX measures." },
  { t: "Dashboard Development", d: "Email Campaign dashboard and Web Engagement dashboard: KPI cards, breakdowns, timeline and top campaigns." },
  { t: "QA & Validation", d: "Reconcile every KPI between SQL, Tableau and Power BI, and document where the KPI document's formulas were corrected." },
];
/* Verbatim from the project PPT (dates as given in the deck). */
const M_TIMELINE = [
  { d: "11-11-2023", t: "9 PM – 10 PM", task: "Kick-off" },
  { d: "18-11-2023", t: "9 PM – 10 PM", task: "KPIs in Excel" },
  { d: "25-12-2023", t: "9 PM – 10 PM", task: "Tableau–SQL" },
  { d: "02-12-2023", t: "9 PM – 10 PM", task: "Power BI–SQL" },
  { d: "09-12-2023", t: "9 PM – 10 PM", task: "Final Presentation" },
];
const M_RULES = [
  { icon: "⚠", ok: false, h: "Attendance is mandatory", p: "Missing more than two meetings results in removal from the project. Join every meeting under the same name you registered with — an unrecognized name gets marked absent." },
  { icon: "⚠", ok: false, h: "Attendance alone isn't enough", p: "Sitting in on meetings without actively contributing will also lead to removal. Participation is graded on contribution, not presence." },
  { icon: "✓", ok: true, h: "Flag non-contributing teammates early", p: "If a team member isn't contributing, it's on the group to inform management — by call, WhatsApp, email, or during the weekly review — rather than letting it slide." },
  { icon: "✓", ok: true, h: "Contribute across every tool", p: "You're expected to contribute to Excel, SQL, Tableau, Power BI, and the final PPT. Skipping even one tool entirely puts your place on the project at risk." },
  { icon: "✓", ok: true, h: "Weekly review presentations", p: "Each group presents its progress every week — consistent updates and a prepared walkthrough are expected, not just a working dashboard at the end." },
];
const M_FOCUS_AREAS = [
  { n: "", h: "Active Contribution", p: "Show up engaged — participate in discussion, don't just observe the build." },
  { n: "", h: "Sharing Insights", p: "Bring your own observations to the team rather than waiting to be assigned tasks." },
  { n: "", h: "Timely Completion", p: "Deliver assigned work inside the agreed deadline, every sprint." },
  { n: "", h: "Collaboration Over Competition", p: "Optimize for the team's dashboard, not for individual credit." },
  { n: "", h: "Clear Communication", p: "Say what you're blocked on before the deadline, not after." },
  { n: "", h: "Active Listening", p: "Actually absorb teammates' updates in review meetings — you'll be asked about their work too." },
  { n: "", h: "Recognizing Contributions", p: "Acknowledge teammates' work — it costs nothing and keeps morale up." },
  { n: "", h: "Daily Team Connectivity", p: "A short daily check-in catches blockers before they become a missed deadline." },
];
const M_SOCIAL = {
  linkedin: "https://www.linkedin.com/in/mahendra-singh-%F0%9F%87%AE%F0%9F%87%B3%F0%9F%9A%80%E2%9D%84%EF%B8%8F-%F0%9F%90%8D-%F0%9F%A6%84-83699485/",
  medium: "https://medium.com/@mahendraa1188",
  youtube: "https://www.youtube.com/channel/UC2q-vZWSlQpiGiMcSLUqnIg",
};
const M_CRACKANALYTICS_URL = "https://www.crackanalytics.com/";
const M_SOFTWARE_LINKS = [
  { name: "How to import a CSV into MySQL", desc: "Step-by-step guide — load the dataset before connecting Tableau or Power BI", icon: "🗄️", type: "link", href: "https://medium.com/@mahendraa1188/how-to-import-csv-into-mysql-c3bbce297910" },
  { name: "MySQL Community Server — download", desc: "Official installer (MySQL 8.x)", icon: "🐬", type: "link", href: "https://dev.mysql.com/downloads/mysql/" },
  { name: "Tableau Desktop — free download", desc: "Official installer from Tableau (free trial / Public edition)", icon: "📈", type: "link", href: "https://www.tableau.com/products/desktop-free/download" },
  { name: "Power BI Desktop — free download", desc: "Official installer from Microsoft", icon: "⚡", type: "link", href: "https://www.microsoft.com/en-us/download/details.aspx?id=58494" },
];
const M_DOCUMENTS = [
  { name: "Excel Starter Template.xlsx", desc: "Email_Summary (one row per email), Campaign_Summary, Social_Summary (Facebook/Instagram), WhatsApp_Summary and the full Web_Engagement table, with a Dashboard tab of live formulas for every KPI (email, social, WhatsApp, web), the KPI document's versions marked ✗ next to the corrected ones, and breakdowns by campaign type, source, device and platform", icon: "🧮", type: "download", href: "assets/docs/AXon_Marketing_Excel_Starter.xlsx", filename: "AXon_Marketing_Excel_Starter.xlsx" },
];

/* ---------------- INTERVIEW ---------------- */
const M_QA_CATS = ["Explain This Project", "SQL", "Power BI & DAX", "Tableau", "Data Modeling", "Marketing Analytics Domain", "Email Marketing", "Social Media & WhatsApp", "Scenario-Based", "General & HR", "Rapid Fire"];
const M_QA = [
  // Explain This Project
  { cat: "Explain This Project", q: "Explain this project to me — what did you actually build?", a: `Tell it as a story: (1) the data — AXon Retail's marketing data for 2023–2024: 61 campaigns, 471 email sends, ${fmtN(A.activities)} email events, 12,000 subscribers, ${fmtN(A.orders)} orders and ${fmtN(A.web_rows)} rows of daily web traffic; (2) the tools — Excel for first KPIs, MySQL for validation and views, Tableau and Power BI for an Email Campaign and a Web Engagement dashboard; (3) the challenge — the KPI document's formulas counted repeat opens, summed unique visitors and averaged rates, so I corrected them and showed both; (4) the outcome — a ${A.human_open_rate}% human open rate instead of the ${A.total_open_rate}% everyone was quoting, and an ROI view showing Cart Abandonment and Loyalty pay back while Re-engagement and Promotional lose money.`, signal: "Almost always the first question — tests structure and communication." },
  { cat: "Explain This Project", q: "What was the business problem?", a: "AXon's marketing team ran dozens of email campaigns and tracked website traffic in separate exports. Engagement was over-reported (repeat and machine opens), spend wasn't tied to revenue, and web KPIs were aggregated the wrong way. They needed one trusted view from send to revenue, and a way to compare campaigns and channels fairly.", signal: "Tests whether you understood the 'why', not just the tools." },
  { cat: "Explain This Project", q: "What data did you use?", a: `Nine tables: Campaigns (103 across Email, Facebook, Instagram, WhatsApp), Emails (471), Activities (${fmtN(A.activities)} recipient-level events), Customers (12,000), Orders (${fmtN(A.orders)}), Web_Engagement (${fmtN(A.web_rows)} rows at date × source × device × region) plus Social_Ads_Daily (41,736 rows of Facebook/Instagram ad results), WhatsApp_Messages (73,221 messages) and Dim_Date (762 days). Campaign_ID links Campaigns to Emails; Email_ID links Emails to Activities and to the attributed orders.`, signal: "Name exact scale and keys." },
  { cat: "Explain This Project", q: "What was your most important insight?", a: `Three things. The real open rate is about ${Math.round(A.human_open_rate)}%, not ${Math.round(A.total_open_rate)}%: ${f1(A.machine_open_share)}% of opens are Apple Mail machine opens and many more are repeats. Second, ROI varies hugely by campaign type: Cart Abandonment returns ${MD.type_roi ? MD.type_roi[0][1] : 1786}% and Loyalty ${MD.type_roi ? MD.type_roi[1][1] : 641}%, while Promotional (${TT.Promotional ? Math.round(TT.Promotional.roi) : -9}%) and Re-engagement (${TT["Re-engagement"] ? Math.round(TT["Re-engagement"].roi) : -49}%) lose money. Third, unsubscribes rose from ${A.year_email ? A.year_email["2023"].unsub : 0.192}% to ${A.year_email ? A.year_email["2024"].unsub : 0.323}% as send volume grew ${A.year_email ? f1((A.year_email["2024"].sent / A.year_email["2023"].sent - 1) * 100) : 34}%.`, signal: "Tests a quantified 'so what'." },
  { cat: "Explain This Project", q: "What would you do differently with more time?", a: "Move from last-click attribution to a holdout test (send a campaign to 90% of the segment, hold back 10%) to measure true incremental revenue, and connect web sessions to customers (UTM + login) so the web and email views join at customer level.", signal: "Shows you know the limits of your own analysis." },
  // SQL
  { cat: "SQL", q: "How do you calculate a unique open rate in SQL?", a: "Count distinct (email_id, customer_id) pairs among Open rows and divide by Delivered rows:\nSELECT COUNT(DISTINCT CASE WHEN activity_type='Open' THEN CONCAT(email_id,'|',customer_id) END) / SUM(activity_type='Delivered') FROM activities;\nCOUNT of Open rows would count repeat opens.", signal: "Tests COUNT DISTINCT vs COUNT." },
  { cat: "SQL", q: "How would you flag Apple Mail machine opens?", a: "Join each Open row to the same recipient's Delivered row (same email_id and customer_id) and flag it when TIMESTAMPDIFF(SECOND, delivered.activity_date, open.activity_date) < 15. Then compute the human open rate on unflagged opens only.", signal: "Self-join with a time condition." },
  { cat: "SQL", q: "Write campaign ROI in SQL.", a: "SELECT c.campaign_name, c.actual_spend_inr, COALESCE(SUM(o.net_revenue_inr),0) AS revenue,\n ROUND(100*(COALESCE(SUM(o.net_revenue_inr),0)-c.actual_spend_inr)/c.actual_spend_inr,1) AS roi_pct\nFROM campaigns c LEFT JOIN orders o ON o.attributed_campaign_id = c.campaign_id AND o.order_status='Delivered'\nGROUP BY c.campaign_id, c.campaign_name, c.actual_spend_inr ORDER BY roi_pct DESC;\nThe status filter sits in the ON clause so campaigns with no orders still appear (LEFT JOIN).", signal: "Tests LEFT JOIN + filter placement." },
  { cat: "SQL", q: "Why put the Order_Status filter in the ON clause and not WHERE?", a: "In a LEFT JOIN, a WHERE filter on the right table removes rows where it is NULL, turning it into an INNER JOIN: campaigns with no Delivered orders would disappear instead of showing ROI = −100%.", signal: "Classic LEFT JOIN trap." },
  { cat: "SQL", q: "How do you find emails sent after a customer unsubscribed?", a: `Join Delivered activities to Customers and keep rows where activity_date > unsubscribe_date. Here that returns ${A.sends_after_unsub} sends: the suppression list is updated with a lag.`, signal: "Business rule as a join condition." },
  { cat: "SQL", q: "How would you calculate session-weighted bounce rate?", a: "SUM(bounced_sessions) / SUM(sessions), never AVG(bounce_rate_pct). The average treats a 20-session row like a 2,000-session row.", signal: "Weighted vs simple average." },
  { cat: "SQL", q: "How do you get each source's share of sessions with a window function?", a: "SELECT traffic_source, SUM(sessions) s, ROUND(100*SUM(sessions)/SUM(SUM(sessions)) OVER (),1) pct FROM web_engagement GROUP BY traffic_source;\nSUM(...) OVER () is the SQL version of DAX ALL().", signal: "Window functions." },
  // Power BI
  { cat: "Power BI & DAX", q: "Write the Unique Opens measure in DAX.", a: "Unique Opens = CALCULATE(COUNTROWS(SUMMARIZE(Activities, Activities[Email_ID], Activities[Customer_ID])), Activities[Activity_Type] = \"Open\")\nSUMMARIZE gives one row per distinct pair, so repeat opens count once.", signal: "Distinct pair counting in DAX." },
  { cat: "Power BI & DAX", q: "Why does Traffic Source % need ALL()?", a: "In a table by source, the filter context limits both the numerator and the denominator to one source, so every row shows 100%. CALCULATE(SUM(Sessions), ALL(Web_Engagement[Traffic_Source])) removes the source filter from the denominator only.", signal: "Filter context." },
  { cat: "Power BI & DAX", q: "Activity_Date has a time. How do you relate it to Dim_Date?", a: "Add a date-only column (Activity_Day = DATE(...) in SQL or DATEVALUE in Power Query) and relate that to Dim_Date[Date]. A datetime never matches a date key, so every activity would fall into a blank date.", signal: "Practical modelling detail." },
  { cat: "Power BI & DAX", q: "How would you write Sessions YoY %?", a: "Sessions YoY % = DIVIDE([Sessions], CALCULATE([Sessions], SAMEPERIODLASTYEAR(Dim_Date[Date]))) - 1. Dim_Date must be marked as a date table and be continuous.", signal: "Time intelligence." },
  { cat: "Power BI & DAX", q: "Attributed revenue is on Orders, spend on Campaigns. How do you compute ROI per campaign?", a: "Relate Orders[Attributed_Campaign_ID] to Campaigns[Campaign_ID] (inactive if it creates ambiguity, then USERELATIONSHIP in the measure). ROI = DIVIDE([Attributed Revenue] − [Campaign Spend], [Campaign Spend]), evaluated per campaign.", signal: "Multi-fact measures." },
  // Tableau
  { cat: "Tableau", q: "How would you build the unique open rate in Tableau?", a: "COUNTD([Email ID] + '|' + [Customer ID]) filtered to Open, divided by the Delivered count. Or, better, use the SQL view vw_email_performance where unique opens are already one column per email and just SUM them.", signal: "COUNTD and pre-aggregation." },
  { cat: "Tableau", q: "Bounce rate on a Tableau map looks too low for East. Why?", a: "If the calc is AVG([Bounce Rate Pct]) it's a simple average of rows. Use SUM([Bounced Sessions]) / SUM([Sessions]) so every region is weighted by traffic.", signal: "Aggregation awareness." },
  { cat: "Tableau", q: "How do you show sent vs activity on one timeline?", a: "Dual-axis: SUM(Recipients) by month from Emails and COUNT(Activities) by month, synchronised or not depending on scale; or a combined axis with Measure Names. Both need the same date grain (Year_Month from Dim_Date).", signal: "Dual axis." },
  // Modeling
  { cat: "Data Modeling", q: "What is the grain of each table?", a: "Campaigns: one campaign. Emails: one send. Activities: one event per recipient (several Open/Click rows possible). Customers: one subscriber. Orders: one order. Web_Engagement: one day × source × device × region. Dim_Date: one day.", signal: "Grain thinking." },
  { cat: "Data Modeling", q: "Can you join Web_Engagement to Customers or Campaigns?", a: "No. Web_Engagement is aggregated traffic for all visitors with no customer or campaign key. It shares only Dim_Date (and Region as an attribute). Email traffic to the site is visible as Traffic_Source = Email, not per campaign.", signal: "Knowing what you can't join." },
  { cat: "Data Modeling", q: "Why build vw_email_performance?", a: "It aggregates 314K events to one row per email (delivered, bounced, unique opens, human opens, unique clicks, unsubs). Every email KPI becomes a simple SUM ratio, both BI tools read the same logic, and QA is one query.", signal: "Mart/view design." },
  // Domain
  { cat: "Marketing Analytics Domain", q: "What is ROAS and how is it different from ROI?", a: `ROAS = revenue ÷ spend (here ${A.roas}). ROI = (revenue − spend) ÷ spend (here ${A.roi}%). ROAS ${A.roas} means ₹${A.roas} back per ₹1; ROI ${A.roi}% means you more than doubled the money. Neither includes product cost, so a profit-based ROI would be lower.`, signal: "Core marketing finance." },
  { cat: "Marketing Analytics Domain", q: "What is attribution, and what model does this dataset use?", a: "Attribution decides which touchpoint gets credit for a sale. Here: last click — an order is credited to the last email the customer clicked within 72 hours before ordering. It's simple but over-credits the final touch and ignores people who would have bought anyway.", signal: "Attribution basics." },
  { cat: "Marketing Analytics Domain", q: "What is incrementality and how would you measure it?", a: "The revenue that happened only because of the campaign. Measure it with a holdout: randomly keep 10% of the target segment out, then compare conversion between mailed and held-out groups.", signal: "Senior-level thinking." },
  { cat: "Marketing Analytics Domain", q: "What is CAC and LTV?", a: "Customer Acquisition Cost = marketing spend ÷ new customers acquired. Lifetime Value = revenue (or margin) a customer brings over their life. A healthy business keeps LTV well above CAC (often 3:1).", signal: "Standard vocabulary." },
  { cat: "Marketing Analytics Domain", q: "Why is mobile conversion lower than desktop here?", a: `Mobile has ${MD.device_pct ? MD.device_pct[0][1] : 64}% of sessions but converts at ${MD.device_cvr ? MD.device_cvr[1][1] : 1.51}% vs ${MD.device_cvr ? MD.device_cvr[0][1] : 2.32}% on desktop: people browse on phones and buy on laptops, and mobile checkout often has more friction. Fixing mobile checkout is usually the biggest web lever.`, signal: "Insight from a breakdown." },
  // Email marketing
  { cat: "Email Marketing", q: "What is Apple Mail Privacy Protection and why does it matter?", a: "Since iOS 15, Apple Mail can pre-load emails on Apple's servers, which fires the open pixel even if the person never looks. Open rates for Apple Mail users become meaningless, so teams report human opens, clicks or CTOR instead.", signal: "Very common modern email question." },
  { cat: "Email Marketing", q: "Hard bounce vs soft bounce?", a: "Hard: permanent (address doesn't exist) — suppress immediately. Soft: temporary (inbox full, server down) — retry, suppress after repeated failures. Mailing hard bounces again hurts sender reputation.", signal: "Deliverability basics." },
  { cat: "Email Marketing", q: "What is CTOR and when is it better than CTR?", a: "Click-to-open rate = unique clickers ÷ unique openers. It tests the email content, independent of the subject line and inbox placement. CTR mixes both.", signal: "Choosing the right ratio." },
  { cat: "Email Marketing", q: "What makes a healthy unsubscribe and spam rate?", a: `Rough benchmarks: unsubscribe below ~0.5% per send and spam complaints below ~0.1% (Gmail and Yahoo enforce 0.3% as a hard limit). AXon is at ${A.unsub_rate}% and ${A.spam_rate}%, but Re-engagement campaigns reach ${MD.type_unsub ? MD.type_unsub[0][1] : 0.86}%.`, signal: "Benchmarks." },
  // Scenario
  { cat: "Scenario-Based", q: "The CMO says 'our open rate is 69%, great job'. What do you say?", a: `Politely reframe: 69% counts every Open row, including repeat opens and Apple Mail's automatic opens. Unique opens are ${A.unique_open_rate}% and human opens ${A.human_open_rate}%. Then show clicks and revenue, which can't be faked by a mail client.`, signal: "Tests integrity and communication." },
  { cat: "Scenario-Based", q: "Promotional campaigns have negative ROI. Should we stop them?", a: "Not immediately. Check whether last-click attribution under-credits them (they may drive visits that convert later), split by discount level and segment, and test with a holdout. Then cut the worst performers, not the whole type.", signal: "Nuanced recommendation." },
  { cat: "Scenario-Based", q: "Your Power BI unique visitors don't match Google Analytics. Why?", a: "GA de-duplicates visitors across the whole period; summing daily Unique_Visitors counts the same person every day they visit. Reconcile on Sessions, and label the summed figure 'visitor-days'.", signal: "Reconciliation thinking." },
  // General
  { cat: "General & HR", q: "Tell me about a time you challenged a requirement.", a: "The KPI document defined Delivery Rate as delivered activities ÷ unique emails, which gave 369.5 — not a percentage. I showed the result, explained the unit mismatch, proposed Delivered ÷ Recipients (98.32%) and kept the original as a documented 'activities per email' metric. The team agreed.", signal: "STAR with a real example." },
  { cat: "General & HR", q: "How did you split work in your group?", a: "Be honest and specific: who owned Excel, SQL views, Tableau, Power BI and QA, and what you personally delivered. Interviewers check consistency with follow-up questions.", signal: "Ownership." },
  // Rapid fire
  { cat: "Rapid Fire", q: "Delivery rate?", a: `${A.delivery_rate}% (Delivered ÷ Recipients).`, signal: "Number recall." },
  { cat: "Rapid Fire", q: "Unique vs human open rate?", a: `${A.unique_open_rate}% vs ${A.human_open_rate}%.`, signal: "Number recall." },
  { cat: "Rapid Fire", q: "Email ROI and ROAS?", a: `${A.roi}% and ${A.roas}.`, signal: "Number recall." },
  { cat: "Rapid Fire", q: "Best and worst campaign type by ROI?", a: "Cart Abandonment best, Re-engagement worst.", signal: "Number recall." },
  { cat: "Rapid Fire", q: "Weighted bounce rate?", a: `${A.bounce_weighted}% (not the ${A.bounce_avg}% simple average).`, signal: "Number recall." },
  // Social & WhatsApp
  { cat: "Social Media & WhatsApp", q: "Facebook vs Instagram: which platform performs better here?", a: `Depends on the metric. Instagram wins engagement (${A.social_platform ? A.social_platform.Instagram.er : 0}% vs ${A.social_platform ? A.social_platform.Facebook.er : 0}%), Facebook wins everything that touches money: CTR ${A.social_platform ? A.social_platform.Facebook.ctr : 0}% vs ${A.social_platform ? A.social_platform.Instagram.ctr : 0}%, CPC ₹${A.social_platform ? A.social_platform.Facebook.cpc : 0} vs ₹${A.social_platform ? A.social_platform.Instagram.cpc : 0}, ROAS ${A.social_platform ? A.social_platform.Facebook.roas : 0} vs ${A.social_platform ? A.social_platform.Instagram.roas : 0}. After product cost Instagram's ad profit is negative. I'd keep Instagram for reach and launches but judge it on profit, not likes.`, signal: "Tests metric choice." },
  { cat: "Social Media & WhatsApp", q: "Why is retargeting ROAS so much higher than prospecting?", a: `Retargeting shows ads to people who already visited or added to cart, so many would have bought anyway. Here retargeting ROAS is ${MD.soc_type_roas ? MD.soc_type_roas[0][1] : 7.4} vs ${MD.soc_type_roas ? (MD.soc_type_roas.find(x => x[0] === "Acquisition") || [0, 1.6])[1] : 1.6} for acquisition. Part of that is real, part is attribution taking credit for intent. Use a holdout or conversion-lift test before shifting all budget to retargeting, or the audience pool will shrink.`, signal: "Incrementality awareness." },
  { cat: "Social Media & WhatsApp", q: "What is the difference between impressions, reach and frequency?", a: "Impressions = times the ad was shown. Reach = unique people who saw it. Frequency = impressions ÷ reach. Reach is de-duplicated per row in an export, so you can't sum it across days or cities.", signal: "Vocabulary + aggregation trap." },
  { cat: "Social Media & WhatsApp", q: "Can you add Meta's purchase value to your orders revenue?", a: "No. Meta reports click-through and view-through purchases with its own attribution window; the Orders table credits Email/WhatsApp clicks within 72 hours. They overlap and use different rules. Show each channel's ROAS with its source label and compare trends, not totals.", signal: "Multi-source attribution." },
  { cat: "Social Media & WhatsApp", q: "How do you calculate the WhatsApp delivery rate from this table?", a: `Message_Status is the final status. Delivered = 'Delivered' + 'Read' rows (${fmtN(A.wa ? A.wa.delivered : 0)}), so the delivery rate is ${A.wa ? A.wa.delivery_rate : 0}%. Counting only 'Delivered' gives ${A.wa ? A.wa.wrong_delivery_rate : 0}%, which is wrong.`, signal: "Status-field logic." },
  { cat: "Social Media & WhatsApp", q: "Why is WhatsApp ROI so high, and would it scale?", a: `WhatsApp goes only to opted-in, mostly loyal customers, costs about ₹${A.wa ? A.wa.cost_per_delivered : 0.76} per delivered message and gets a ${A.wa ? A.wa.read_rate : 71}% read rate, so ROI is ${A.wa ? A.wa.roi : 0}%. It won't scale linearly: the opted-in base is limited (${fmtN(A.wa ? A.wa.opted_in : 0)} customers), opt-outs rise with frequency and Meta caps marketing messages per user.`, signal: "Thinks about scale and saturation." },
  { cat: "Social Media & WhatsApp", q: "Which ad format would you recommend?", a: `For clicks, Collection (${MD.soc_format_ctr ? MD.soc_format_ctr[0][1] : 1.7}% CTR) and Image on Facebook. For engagement, Reels and Stories (~${MD.soc_format_er ? MD.soc_format_er[0][1] : 3}% engagement). Pick by objective: conversion campaigns on catalogue/collection formats, awareness on Reels.`, signal: "Objective-driven recommendation." },
  { cat: "Social Media & WhatsApp", q: "How would you reconcile Meta Ads Manager with your web analytics?", a: "Spend should match exactly (here it does by date × platform × device × region, except the 2024-03-12 outage). Clicks will be higher than sessions (not every click loads the page). Purchases will differ because of view-through and attribution windows. Reconcile spend first, then explain the rest.", signal: "Reconciliation discipline." },
];
const M_GLOSSARY = [
  { t: "Delivery Rate", d: "Delivered ÷ sent. The share of emails that reached an inbox." },
  { t: "Bounce (hard / soft)", d: "An email that couldn't be delivered: permanently (hard) or temporarily (soft)." },
  { t: "Open Rate (unique)", d: "Recipients who opened at least once ÷ delivered." },
  { t: "Machine open", d: "An open fired automatically by a mail client (Apple Mail Privacy Protection), not by a person." },
  { t: "CTR", d: "Unique clickers ÷ delivered." },
  { t: "CTOR", d: "Unique clickers ÷ unique openers: measures content quality." },
  { t: "Unsubscribe rate", d: "Unsubscribes ÷ delivered." },
  { t: "Spam complaint rate", d: "Spam reports ÷ delivered. Keep it under 0.1%." },
  { t: "Suppression list", d: "Addresses that must not be mailed: unsubscribes and hard bounces." },
  { t: "Attribution", d: "Rule for crediting a sale to a marketing touch. Last click within 72 h here." },
  { t: "ROI", d: "(Revenue − spend) ÷ spend." },
  { t: "ROAS", d: "Revenue ÷ ad spend." },
  { t: "AOV", d: "Average order value: revenue ÷ orders." },
  { t: "Session", d: "One visit to the website or app." },
  { t: "Unique visitor", d: "A distinct person in a period. Not additive across days." },
  { t: "Bounce rate (web)", d: "Single-page sessions ÷ sessions." },
  { t: "Conversion rate", d: "Conversions ÷ sessions (web) or orders ÷ delivered (email)." },
  { t: "Traffic source", d: "Where a visit came from: organic, paid, social, direct, email, referral." },
  { t: "A/B test", d: "Sending two variants to random halves of an audience to see which performs better." },
  { t: "Holdout group", d: "A random slice kept out of a campaign to measure its incremental effect." },
  { t: "Grain", d: "What one row of a table represents." },
  { t: "Fact table", d: "A table of measurable events: Activities, Orders, Web_Engagement." },
  { t: "Dimension table", d: "A descriptive table: Campaigns, Customers, Dim_Date." },
  { t: "Weighted average", d: "An average where each row counts in proportion to its size (e.g. sessions)." },
  { t: "ALL()", d: "DAX function that removes filters: used for percent-of-total measures." },
  { t: "COUNT DISTINCT", d: "Counts unique values (or pairs) instead of rows." },
  { t: "Impressions", d: "Number of times an ad was shown." },
  { t: "Reach", d: "Unique people who saw an ad. Not additive across rows." },
  { t: "Frequency", d: "Impressions ÷ reach: how often the same person saw the ad." },
  { t: "CPM", d: "Cost per 1,000 impressions." },
  { t: "CPC", d: "Cost per link click." },
  { t: "CPA", d: "Cost per acquisition (purchase)." },
  { t: "Engagement rate (social)", d: "(Likes + comments + shares + saves) ÷ impressions." },
  { t: "View-through conversion", d: "A purchase after someone saw (not clicked) an ad; counted by Meta, not by last-click models." },
  { t: "Retargeting", d: "Ads shown to people who already visited, engaged or added to cart." },
  { t: "Lookalike audience", d: "Meta audience of people similar to your buyers." },
  { t: "WhatsApp template", d: "A pre-approved message format required for marketing messages." },
  { t: "Read rate", d: "Read ÷ delivered (blue ticks)." },
  { t: "Opt-in / opt-out", d: "Consent to receive messages / withdrawal of it (STOP)." },
  { t: "UTM parameters", d: "Tags on links (utm_source, utm_campaign) that tell web analytics where a visit came from." },
  { t: "Gross margin", d: "(Revenue − product cost) ÷ revenue." },
];
const M_TIPS = [
  { n: "01", h: "Tell the project as a story, not a feature list", p: "Data & scale → tools → the challenge you hit → the business outcome. Interviewers remember stories, not tool lists." },
  { n: "02", h: "Always use real numbers", p: `"Large email dataset" says nothing. "${fmtN(A.activities)} email events, ${A.human_open_rate}% human open rate, ${A.roi}% email ROI" says everything.` },
  { n: "03", h: "Know where the document was wrong", p: "Being able to say 'the brief said X, it gave 369.5, so I changed it to Y' is the most convincing proof you did the work yourself." },
  { n: "04", h: "Lead every KPI with its business question", p: "'Of the people who opened, how many clicked?' beats 'CTOR is a ratio'." },
  { n: "05", h: "Have one honest challenge story", p: "Machine opens, summed visitors or the 12.5%-per-source chart are all real, specific stories from this data." },
  { n: "06", h: "Contribute across every tool", p: "This capstone is graded on Excel, SQL, Tableau, Power BI and QA together." },
  { n: "07", h: "Practise explaining to a non-technical CMO", p: "No jargon: 'one in three people actually opened our emails'." },
  { n: "08", h: "Structure scenario answers the same way", p: "Clarify → diagnose with data → quantify → recommend one next step." },
];
const M_TIP_CALLOUT = "Cracking a data analyst interview isn't about reciting definitions — it's about showing how you think: a KPI document that counts repeat opens, a rate column that someone averaged, a CMO who loves a 69% open rate. Every question in the Interview tab tests one of those moments.";
const M_RESUME_BULLETS = [
  `Built Email Campaign and Web Engagement dashboards in Tableau and Power BI on ${fmtN(A.activities)} email events, 61 campaigns and 16M web sessions, reconciled to MySQL.`,
  `Corrected the KPI brief's open-rate logic (repeat and Apple Mail machine opens), restating open rate from ${A.total_open_rate}% to a ${A.human_open_rate}% human open rate.`,
  `Linked campaign spend to last-click attributed revenue, showing ${A.roi}% overall email ROI and ${A.neg_roi_campaigns} loss-making campaigns, led by Re-engagement and Promotional types.`,
  "Replaced row-count and simple-average web KPIs with session-weighted measures (bounce, duration, source share) in SQL and DAX.",
  `Flagged ${A.sends_after_unsub} post-unsubscribe sends and ${A.repeat_hard_bounce_customers} repeat hard-bounce addresses as compliance and deliverability risks.`,
  `Added Facebook, Instagram and WhatsApp to the model: Facebook ROAS ${A.social_platform ? A.social_platform.Facebook.roas : ""} vs Instagram ${A.social_platform ? A.social_platform.Instagram.roas : ""}, WhatsApp ROI ${A.wa ? A.wa.roi : ""}% on ${fmtN(A.wa ? A.wa.sent : 0)} messages; reconciled Meta spend to web ad spend by day.`,
];
const M_PROJECT_FAQ = [
  { q: "What if the interviewer isn't technical?", a: "Lead with the business framing (the team didn't know which campaigns made money) and the outcome (real open rate, ROI by campaign type), and go into SQL/DAX only when asked." },
  { q: "What if I only worked on one part?", a: "Say so and go deep on your part. A detailed answer about what you owned beats a vague one that implies you did everything." },
  { q: "Why marketing data?", a: "It forces you to deal with event-level data, distinct counting, weighted averages and attribution: problems that appear in almost every analytics job." },
  { q: "The data is synthetic. Will that hurt?", a: "Say so openly: it's a training dataset built on the original project structure, with real-world quirks (machine opens, bounces, missing days) designed in. What matters is that your logic would work on real data." },
  { q: "Why two BI tools?", a: "The capstone asks for KPI parity across Tableau and Power BI as a reconciliation exercise. In a job you'd usually use one." },
  { q: "What if I forget a number?", a: "Give the direction and rough size ('about a third of people open') instead of a wrong precise number." },
];
const M_LEARNING_LINKS = [
  { title: "Email marketing metrics explained (Mailchimp)", desc: "Open rate, click rate, bounce and unsubscribe benchmarks by industry.", url: "https://mailchimp.com/resources/email-marketing-benchmarks/", source: "Mailchimp" },
  { title: "Apple Mail Privacy Protection (Litmus)", desc: "Why opens from Apple Mail can't be trusted and what to measure instead.", url: "https://www.litmus.com/blog/apple-mail-privacy-protection-for-marketers", source: "Litmus" },
  { title: "Google Analytics: sessions, users and bounce", desc: "How web analytics tools define sessions and users.", url: "https://support.google.com/analytics/answer/11986666", source: "Google" },
  { title: "Tableau — Free Training Videos", desc: "Connecting to data, building views and dashboards.", url: "https://www.tableau.com/learn/training", source: "Tableau" },
  { title: "Tableau Public Gallery", desc: "Published marketing dashboards for layout inspiration.", url: "https://public.tableau.com/en-us/s/", source: "Tableau" },
  { title: "Power BI Learning Paths (Microsoft Learn)", desc: "Modelling, DAX and report building with hands-on labs.", url: "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", source: "Microsoft" },
  { title: "Star Schema Design Guidance", desc: "Why every fact table here relates to Dim_Date.", url: "https://learn.microsoft.com/en-us/power-bi/guidance/star-schema", source: "Microsoft" },
  { title: "MySQL Official Documentation", desc: "LOAD DATA, window functions and date functions.", url: "https://dev.mysql.com/doc/", source: "MySQL" },
  { title: "Meta Ads: about ad reporting & metrics", desc: "How Meta defines reach, impressions, results and attribution settings.", url: "https://www.facebook.com/business/measurement", source: "Meta" },
  { title: "WhatsApp Business Platform pricing", desc: "How marketing conversations are charged per message/conversation.", url: "https://developers.facebook.com/docs/whatsapp/pricing", source: "Meta for Developers" },
];
const M_WEAK_STRONG = [
  { q: "What is the open rate of your campaigns?",
    weak: `It's ${A.total_open_rate}%. Open rate = opens ÷ delivered.`,
    strong: `Depends how you count. Open rows ÷ delivered is ${A.total_open_rate}%, but that counts repeat opens. Unique opens give ${A.unique_open_rate}%, and once I remove Apple Mail's automatic opens the human open rate is ${A.human_open_rate}%. I report the human rate and back it with clicks: unique CTR ${A.unique_ctr}%, CTOR ${A.ctor}%.` },
  { q: "Which campaign performed best?",
    weak: "Cart Abandonment Reminders, because it has the most activities.",
    strong: `By activity volume it's Cart Abandonment Reminders (${MD.top_campaigns_acts ? fmtN(MD.top_campaigns_acts[0][1]) : ""} events, ${A.top_campaign_acts ? A.top_campaign_acts[3] : 10.1}%), but it's always-on, so volume mostly reflects how long it ran. By CTR the Gold Member Early Access campaigns lead (${A.top_campaign_ctr ? A.top_campaign_ctr[2] : 25.3}%), and by ROI Cart Abandonment is still top at ${MD.type_roi ? MD.type_roi[0][1] : 1786}%. 'Best' needs a metric agreed with the business.` },
  { q: "How did you calculate average bounce rate?",
    weak: "I took the average of the Bounce Rate column.",
    strong: `A plain AVERAGE gives ${A.bounce_avg}%, but rows have very different session counts. I used SUM(Bounced_Sessions) ÷ SUM(Sessions) = ${A.bounce_weighted}%, which is what a web analytics tool would report.` },
  { q: "Which social platform should get more budget?",
    weak: "Instagram, because it gets the most likes and engagement.",
    strong: `Instagram has the higher engagement rate (${A.social_platform ? A.social_platform.Instagram.er : 0}% vs ${A.social_platform ? A.social_platform.Facebook.er : 0}%), but Facebook returns ${A.social_platform ? A.social_platform.Facebook.roas : 0}× its spend vs ${A.social_platform ? A.social_platform.Instagram.roas : 0}× and Instagram's ad profit is negative after product cost. I'd shift conversion budget to Facebook retargeting and keep Instagram for launches and reach, then confirm with a lift test.` },
];
/* ============================================================
   AXon Marketing Analytics — site content built on M_ constants.
   ============================================================ */
const CERTIVA_URL = "https://www.certiva.co.in/";
const CRACKANALYTICS_URL = M_CRACKANALYTICS_URL;
const SRCP = (name) => (MD.src_sessions_pct || []).find(x => x[0] === name) || [name, 0];

/* ---------------- KPIs ---------------- */
const KPI_Q = {
  "Delivery Rate": "How many of the emails we sent actually reached an inbox?",
  "Open Rate (Unique)": "What share of people who received the email opened it?",
  "Click-Through Rate (Unique CTR)": "What share of recipients clicked through to the site?",
  "Campaign Engagement Rate": "How much of all email activity does each campaign generate?",
  "Top Performing Campaigns": "Which campaigns perform best, and by which measure?",
  "Avg Activity per Email": "How much activity does a typical send generate?",
  "Activity Breakdown by Type": "What happens to our emails after we send them?",
  "Email Sent vs Activity Timeline": "Does activity follow send volume month by month?",
  "Total Unique Visitors": "How many people visit the website?",
  "Avg Bounce Rate": "How many visits leave after one page?",
  "Avg Session Duration": "How long does a visit last?",
  "Traffic Source Breakdown": "Where does our website traffic come from?",
  "Device Usage Share": "Which devices do visitors use?",
  "Top Regions by Unique Visitors": "Which regions bring the most visitors?",
  "Engagement by Date": "How does traffic move over time and seasons?",
  "Human Open Rate": "How many real people opened, excluding automatic Apple Mail opens?",
  "Click-to-Open Rate (CTOR)": "Of those who opened, how many clicked?",
  "Email ROI %": "Do our email campaigns earn more than they cost?",
  "ROAS": "How much revenue comes back for every rupee spent?",
  "Unsubscribe Rate": "How many recipients ask us to stop emailing?",
  "Website Conversion Rate": "What share of visits end in a purchase?",
  "Ad Spend (Facebook + Instagram)": "How much are we spending on Meta ads?",
  "Impressions": "How many times were our ads shown?",
  "Reach": "How many different people saw our ads?",
  "Link CTR": "What share of ad views turn into a click to the site?",
  "CPC (Cost per Click)": "What does one visit from an ad cost?",
  "CPM (Cost per 1,000 Impressions)": "What does it cost to be seen 1,000 times?",
  "Engagement Rate (Social)": "How much do people interact with our ads?",
  "Social Conversion Rate": "What share of ad clicks end in a purchase?",
  "Cost per Purchase (CPA)": "What do we pay for one sale from ads?",
  "Social ROAS (platform-reported)": "How much revenue does Meta say each rupee of ads brings back?",
  "Ad Profit & Profit %": "Do our ads make money after product cost?",
  "WhatsApp Messages Sent": "How many WhatsApp messages did we send?",
  "WhatsApp Delivery Rate": "How many WhatsApp messages reached the phone?",
  "WhatsApp Read Rate": "How many delivered messages were read?",
  "WhatsApp Click Rate": "How many recipients tapped the button?",
  "WhatsApp Reply Rate": "How many customers replied?",
  "WhatsApp Opt-out Rate": "How many people asked us to stop?",
  "Cost per Delivered Message": "What does one delivered WhatsApp message cost?",
  "WhatsApp ROI %": "Does WhatsApp earn more than it costs?",
  "Spend by Channel": "Where does the marketing money go?",
  "ROAS by Channel": "Which channel returns the most per rupee?",
  "Gross Margin %": "How much of each rupee of sales is left after product cost?",
  "Total Marketing Spend": "What do we spend on marketing in total?",
};
const docVsTrue = (doc, tru) => `${tru}  (KPI-doc formula: ${doc})`;
const KPI_V = {
  "Delivery Rate": A.delivery_rate + "%",
  "Open Rate (Unique)": A.unique_open_rate + "%",
  "Click-Through Rate (Unique CTR)": A.unique_ctr + "%",
  "Campaign Engagement Rate": `${A.top_campaign_acts ? A.top_campaign_acts[3] : 10.1}% (Cart Abandonment Reminders, the top campaign)`,
  "Top Performing Campaigns": `${A.top_campaign_acts ? fmtN(A.top_campaign_acts[2]) : ""} activities: Cart Abandonment Reminders`,
  "Avg Activity per Email": String(A.avg_act_per_email),
  "Activity Breakdown by Type": `${fmtN(A.delivered)} Delivered · ${fmtN(A.opens)} Open · ${fmtN(A.clicks)} Click · ${fmtN(A.bounced)} Bounced`,
  "Email Sent vs Activity Timeline": `${fmtN(A.sent)} sent → ${fmtN(A.activities)} activities (peak Oct 2024)`,
  "Total Unique Visitors": fmtN(A.uv_sum) + " visitor-days (summed: not distinct people)",
  "Avg Bounce Rate": A.bounce_weighted + "% (session-weighted)",
  "Avg Session Duration": f2(A.dur_weighted) + " min (session-weighted)",
  "Traffic Source Breakdown": `${SRCP("Organic Search")[1]}% Organic Search · ${SRCP("Google Ads")[1]}% Google Ads (by sessions)`,
  "Device Usage Share": `${MD.device_pct ? MD.device_pct[0][1] : 64}% Mobile · ${MD.device_pct ? MD.device_pct[1][1] : 30}% Desktop (by sessions)`,
  "Top Regions by Unique Visitors": `${MD.region_uv_m ? MD.region_uv_m[0][1] : 4.3}M West, then North, South, East`,
  "Engagement by Date": `${A.web_peak_month ? fmtN(A.web_peak_month[1]) : ""} sessions in the peak month (2024-10)`,
  "Emails Sent": fmtN(A.sent), "Delivered": fmtN(A.delivered), "Bounce Rate": A.bounce_rate + "%",
  "Hard Bounces": fmtN(A.hard_bounce) + ` (${A.hard_bounce_customers} customers)`,
  "Human Open Rate": A.human_open_rate + "%", "Click-to-Open Rate (CTOR)": A.ctor + "%",
  "Unsubscribe Rate": A.unsub_rate + "%", "Spam Complaint Rate": A.spam_rate + "%",
  "Campaign Spend": inr(A.spend), "Attributed Revenue": inr(A.attr_rev), "Email ROI %": A.roi + "%", "ROAS": String(A.roas),
  "Email Conversion Rate": A.conv_rate + "%", "Revenue per Email Sent": "₹" + f2(A.rev_per_email_sent),
  "Net Revenue (Delivered)": inr(A.net_rev_delivered) + " (" + inrCr(A.net_rev_delivered) + ")", "Average Order Value": inr(A.aov), "Return Rate": A.return_rate + "%",
  "Sessions": fmtN(A.sessions), "Website Conversion Rate": A.web_cvr + "%", "Pages per Session": f2(A.pages_per_session),
  "Paid ROAS (Web)": (MD.roas_paid || []).map(x => x[0] + " " + x[1]).join(" · "),
  "Sessions YoY %": "+" + A.sessions_yoy + "%",
  ...(() => { const S = A.social || {}, P = A.social_platform || { Facebook: {}, Instagram: {} }, W = A.wa || {}, C = A.channels || {}; return {
    "Ad Spend (Facebook + Instagram)": inr(S.spend) + ` (FB ${inrL(P.Facebook.spend)} · IG ${inrL(P.Instagram.spend)})`,
    "Impressions": fmtN(S.impressions), "Reach": fmtN(S.reach) + " (summed rows: upper bound)",
    "Link CTR": S.ctr + `% (FB ${P.Facebook.ctr}% · IG ${P.Instagram.ctr}%)`, "CPC (Cost per Click)": "₹" + f2(S.cpc) + ` (FB ₹${f2(P.Facebook.cpc)} · IG ₹${f2(P.Instagram.cpc)})`,
    "CPM (Cost per 1,000 Impressions)": "₹" + f2(S.cpm), "Engagement Rate (Social)": S.er + `% (FB ${P.Facebook.er}% · IG ${P.Instagram.er}%)`,
    "Social Conversion Rate": S.cvr + "%", "Cost per Purchase (CPA)": inr(S.cpa), "Social ROAS (platform-reported)": S.roas + ` (FB ${P.Facebook.roas} · IG ${P.Instagram.roas})`,
    "Ad Profit & Profit %": inr(S.profit) + ` · ${S.profit_pct}% (FB ${inrL(P.Facebook.profit)} · IG ${inrL(P.Instagram.profit)})`,
    "WhatsApp Messages Sent": fmtN(W.sent), "WhatsApp Delivery Rate": W.delivery_rate + "%", "WhatsApp Read Rate": W.read_rate + "%", "WhatsApp Click Rate": W.click_rate + "%",
    "WhatsApp Reply Rate": W.reply_rate + "%", "WhatsApp Opt-out Rate": W.optout_rate + "%", "Cost per Delivered Message": "₹" + f2(W.cost_per_delivered), "WhatsApp ROI %": W.roi + "%",
    "Spend by Channel": Object.keys(C).map(k => k + " " + inrL(C[k].spend)).join(" · "), "ROAS by Channel": Object.keys(C).map(k => k + " " + C[k].roas).join(" · "),
    "Gross Margin %": A.gross_margin_pct + "%", "Total Marketing Spend": inr((A.total_campaign_spend || 0) + (A.google_ads_spend || 0)) + " (incl. Google Ads " + inrCr(A.google_ads_spend || 0) + ")" }; })(),
};
const KPI_WRONG = {
  "Delivery Rate": `${A.doc_delivery} with the KPI document's formula (delivered activities ÷ unique emails): that's recipients per email, not a rate`,
  "Open Rate (Unique)": `${A.total_open_rate}% if you divide all Open rows by Delivered: repeat opens counted again`,
  "Click-Through Rate (Unique CTR)": `${A.doc_ctr}% with the document's Click ÷ Open on raw rows (a click-to-open ratio of activity counts)`,
  "Campaign Engagement Rate": "100% on every row if ALL() is missing from the denominator",
  "Top Performing Campaigns": "Ranking by activity count rewards big and always-on campaigns: check CTR and ROI too",
  "Total Unique Visitors": "Summing daily Unique_Visitors double-counts repeat visitors: it is not a count of people",
  "Avg Bounce Rate": `${A.bounce_avg}% with AVERAGE(Bounce_Rate_Pct): every row weighted equally`,
  "Avg Session Duration": `${A.dur_avg} min with a plain AVERAGE of the rows`,
  "Traffic Source Breakdown": "12.5% for every source if you count rows (the document's 'count of rows')",
  "Device Usage Share": "33.3% for every device if you count rows",
  "Top Regions by Unique Visitors": "'Top 5' — there are only 4 regions in this data",
  "Engagement by Date": "A gap on 2024-03-12 (tracking outage): don't draw it as zero traffic",
  "Human Open Rate": "Same as unique open rate if the Apple Mail machine opens aren't removed",
  "Attributed Revenue": `${inr(A.attr_rev_all_status)} if Returned and Cancelled orders are included`,
  "Email ROI %": `${f1((A.attr_rev_all_status - A.spend) / A.spend * 100)}% if Returned/Cancelled orders count as revenue; worse if Budget is used instead of Actual_Spend`,
  "Net Revenue (Delivered)": `${inr(A.net_rev_all)} if all order statuses are summed`,
  "Reach": "SUM over rows double-counts people seen on several days / cities",
  "Engagement Rate (Social)": `${A.soc_rows_er_avg}% if you AVERAGE each row's rate; ${A.social ? A.social.er_reach : ""}% if you divide by summed Reach`,
  "Social ROAS (platform-reported)": "Inflated if added to Orders revenue: Meta also counts view-through purchases",
  "WhatsApp Delivery Rate": `${A.wa ? A.wa.wrong_delivery_rate : ""}% if you count only Message_Status = 'Delivered' (Read messages were delivered too)`,
  "WhatsApp Read Rate": "Lower if divided by Sent instead of Delivered",
  "Cost per Delivered Message": "Higher if failed messages are counted (they're free)",
  "ROAS by Channel": "Misleading if Meta's platform numbers and Orders attribution are ranked as one scale",
  "Ad Profit & Profit %": "Looks like ROAS profit if you forget product cost: revenue − spend is not profit",
};
const KPI_TIER = {
  "Delivery Rate": "P1", "Open Rate (Unique)": "P1", "Click-Through Rate (Unique CTR)": "P1", "Campaign Engagement Rate": "P1", "Top Performing Campaigns": "P1",
  "Avg Activity per Email": "P1", "Activity Breakdown by Type": "P1", "Email Sent vs Activity Timeline": "P1",
  "Total Unique Visitors": "P1", "Avg Bounce Rate": "P1", "Avg Session Duration": "P1", "Traffic Source Breakdown": "P1", "Device Usage Share": "P1", "Top Regions by Unique Visitors": "P1", "Engagement by Date": "P1",
  "Emails Sent": "P2", "Delivered": "P2", "Bounce Rate": "P2", "Human Open Rate": "P2", "Click-to-Open Rate (CTOR)": "P2", "Unsubscribe Rate": "P2", "Campaign Spend": "P2", "Attributed Revenue": "P2", "Email ROI %": "P2", "ROAS": "P2", "Sessions": "P2", "Website Conversion Rate": "P2",
  "Ad Spend (Facebook + Instagram)": "P2", "Link CTR": "P2", "CPC (Cost per Click)": "P2", "Engagement Rate (Social)": "P2", "Social ROAS (platform-reported)": "P2", "Ad Profit & Profit %": "P2",
  "WhatsApp Delivery Rate": "P2", "WhatsApp Read Rate": "P2", "WhatsApp Click Rate": "P2", "WhatsApp ROI %": "P2", "ROAS by Channel": "P2",
};
const KPIS = M_KPIS.map((k, i) => ({
  id: "k" + (i + 1), name: k.name, cat: k.cat, q: KPI_Q[k.name] || k.desc, desc: k.desc,
  plain: k.definition || k.desc, formula: k.formula, dax: k.name.replace(/[^A-Za-z0-9 %()]/g, "") + " = " + k.formula, table: k.table,
  v25: KPI_V[k.name] || "—", wrong: KPI_WRONG[k.name] || "", prio: KPI_TIER[k.name] || "P3",
  dir: /Bounce|Unsub|Spam|Return|Hard|CPC|CPM|CPA|Cost per|Opt-out|Spend/.test(k.name) ? "lower is better" : "higher is better",
}));
const KPI_CATS = M_KPI_CATS;

/* ---------------- STATS ---------------- */
const STATS = [
  { num: fmtN(A.activities), lbl: "Email events (2023–2024)" },
  { num: String(A.campaigns_all || 103), lbl: "Campaigns · Email, FB, IG, WhatsApp" },
  { num: A.human_open_rate + "%", lbl: "Human open rate" },
  { num: "15 → " + M_KPIS.length, lbl: "KPI-doc KPIs → full register" },
  { num: (A.social_platform ? A.social_platform.Facebook.roas : "") + " vs " + (A.social_platform ? A.social_platform.Instagram.roas : ""), lbl: "ROAS: Facebook vs Instagram" },
];

/* ---------------- JOURNEY ---------------- */
const JOURNEY = [
  { id: "j1", t: "Understand the Business Problem", d: "Read the problem statement and the 8 business questions. Write down, in one line, what the CMO wants to decide.", go: "problem", track: "business" },
  { id: "j2", t: "Explore the Dataset", d: "Open all 9 tables. Note the grains: one row per event in Activities (repeat opens!), one row per message in WhatsApp_Messages, one row per day × campaign × format × city × device in Social_Ads_Daily, one row per day × source × device × region in Web_Engagement.", go: "dataset", track: "business" },
  { id: "j3", t: "Build the Data Model", d: "Campaigns → Emails → Activities, Campaigns → Social_Ads_Daily and WhatsApp_Messages, Customers → Activities/WhatsApp/Orders, and Dim_Date to every fact. Web_Engagement joins only through Dim_Date (and on Date × Platform × Device × Region to reconcile ad spend).", go: "model", track: "model" },
  { id: "j4", t: "Clean & Validate the Data", d: "Row counts, Recipients = Delivered + Bounced, no activity before its send, sends after unsubscribe, repeat hard bounces, the missing web day.", go: "quality", track: "model" },
  { id: "j5", t: "Write SQL Queries", d: "Load into MySQL, run the KPI queries and build vw_email_performance and vw_campaign_roi.", go: "sql", track: "sql" },
  { id: "j6", t: "Create KPIs", d: "Implement the 15 KPI-document KPIs first (P1), with the corrected logic. Then the extended register: human opens, CTOR, ROI, ROAS, conversion.", go: "kpis", track: "kpi" },
  { id: "j7", t: "Build the Tableau Dashboard", d: "Tableau–SQL: connect to MySQL and build the Email Campaign and Web Engagement dashboards.", go: "dashboards", track: "tableau" },
  { id: "j8", t: "Build the Power BI Dashboard", d: "Power BI–SQL: same two dashboards, a marked Dim_Date and the DAX measures.", go: "dashboards", track: "powerbi" },
  { id: "j9", t: "Perform QA", d: "Reconcile every KPI between SQL, Tableau and Power BI. Document each KPI-document formula you corrected and why.", go: "qa", track: "qa" },
  { id: "j10", t: "Present Your Business Insights", d: "Build the 8-section final deck (Group Details → Key Takeaway), rehearse the 90-second pitch and update your resume.", go: "analysis", track: "career" },
];
const DELIVERABLES = [
  { id: "d1", t: "Business Requirement Summary", d: "Problem, stakeholders, requirements, KPI list, page wireframes.", where: "Problem & Business Questions", track: "business" },
  { id: "d2", t: "Data Dictionary", d: "Every table and column with grain and quirks.", where: "Data Dictionary", track: "model" },
  { id: "d3", t: "Data Model", d: "Star schema around Dim_Date; keys Campaign_ID, Email_ID, Customer_ID.", where: "Data Model", track: "model" },
  { id: "d4", t: "SQL Queries", d: "Load scripts, validation checks, KPI queries and the two views (.sql file). The 'SQL Query Image' slide comes from here.", where: "SQL Lab", track: "sql" },
  { id: "d5", t: "KPI List", d: "Business question, formula and DAX for every KPI, with the KPI-document corrections noted.", where: "KPI Library", track: "kpi" },
  { id: "d6", t: "Excel Dashboard", d: "KPIs in Excel with live formulas and pivots.", where: "Excel Analysis", track: "excel" },
  { id: "d7", t: "Tableau Dashboard", d: "Email Campaign + Web Engagement dashboards (.twbx).", where: "Dashboard Gallery", track: "tableau" },
  { id: "d8", t: "Power BI Dashboard", d: "Same pages in Power BI (.pbix) with DAX measures.", where: "Dashboard Gallery", track: "powerbi" },
  { id: "d9", t: "QA Validation", d: "Reconciliation sheet: SQL vs Tableau vs Power BI for every P1 KPI.", where: "QA & Reconciliation", track: "qa" },
  { id: "d10", t: "Key Takeaways", d: "5 insights + 5 recommendations backed by numbers.", where: "Business Analysis", track: "career" },
  { id: "d11", t: "Final Presentation", d: "8 sections: Group Details, Summary, KPI List, Excel, Tableau, Power BI, SQL Query Image, Key Takeaway.", where: "90-sec Project Pitch", track: "career" },
  { id: "d12", t: "Resume Project Description", d: "Copy-ready project block and tailored bullets.", where: "Resume, LinkedIn & Portfolio", track: "career" },
];
const BEFORE_AFTER = {
  before: ["Campaign, email, event, order and web data in separate exports", `Open rate reported as ${A.total_open_rate}% (repeat + machine opens)`, "No link between campaign spend and revenue", "Instagram judged on likes, WhatsApp not measured at all", "Unique visitors summed, bounce rates averaged", "Every traffic source looks like 12.5%", "Unsubscribed and hard-bounced addresses still mailed"],
  after: ["MySQL marketing mart (7 tables, 2 views)", "Validated, reconciled KPIs", `Human open rate ${A.human_open_rate}%, CTR ${A.unique_ctr}%, CTOR ${A.ctor}%`, "ROI and ROAS per campaign, type and channel (Email, Facebook, Instagram, WhatsApp)", "Session-weighted web KPIs by source, device and region"],
};

/* ---------------- PROBLEM ---------------- */
const PROBLEM_STATEMENT = M_PROBLEM_STATEMENT;
const REQUIREMENTS = [
  ["R1", "Email delivery & engagement", "CMO, Email Marketing Manager", "Emails sent, Delivery Rate, Unique/Human Open Rate, CTR, CTOR, Unsubscribe Rate", "P1"],
  ["R2", "Campaign performance", "Email Marketing Manager", "Campaign Engagement Rate, Top campaigns, Avg Activity per Email, Activity breakdown", "P1"],
  ["R3", "Send vs activity timeline", "Email Marketing Manager", "Monthly emails sent vs activities", "P1"],
  ["R4", "Campaign ROI", "CMO, Finance", "Spend, attributed revenue (Delivered orders), ROI, ROAS by campaign and type", "P2"],
  ["R5", "Web engagement", "Digital / Growth Manager", "Sessions, Unique Visitors, Bounce Rate, Session Duration, Conversion Rate", "P1"],
  ["R6", "Channel, device & region", "Digital / Growth Manager", "Traffic source share, device share, top regions, CVR by source and device", "P1"],
  ["R7", "Global filters", "All users", "Date, channel, campaign type, campaign, segment, loyalty tier, source, device, region", "P1"],
  ["R9", "Social media performance", "Social Media Manager, CMO", "Spend, impressions, CTR, CPC, CPM, engagement rate, likes/comments/shares, ROAS, profit % by platform, format and city", "P2"],
  ["R10", "WhatsApp campaigns", "CRM Manager", "Sent, delivery, read, click, reply, opt-out rates, cost per message, ROI", "P2"],
  ["R11", "Channel comparison", "CMO, Finance", "Spend, revenue, ROAS and ROI by channel, with the attribution source labelled", "P2"],
  ["R8", "Data governance", "QA reviewer", "Every KPI reconciles to SQL; KPI-document corrections documented", "P1"],
];
const P_ = (p, k) => (A.social_platform && A.social_platform[p] ? A.social_platform[p][k] : 0);
const W_ = (k) => (A.wa ? A.wa[k] : 0);
function bq() {
  const t = TT, ty = (k, f) => (t[k] ? t[k][f] : 0);
  return [
    { q: "What is our real open rate?", data: "Activities (Open, Delivered), Customers (Email_Client)", kpi: "Open Rate (unique), Human Open Rate",
      analysis: "Count distinct openers per email instead of Open rows; flag opens within 15 s of delivery as machine opens.",
      insight: `Open rows ÷ delivered = ${A.total_open_rate}%. Unique openers = ${A.unique_open_rate}%. Without Apple Mail's machine opens (${f1(A.machine_open_share)}% of Open rows) the human open rate is ${A.human_open_rate}%. Apple Mail users show 82.9% raw but 32.3% human.`,
      rec: "Report the human open rate and CTOR on the dashboard; stop using raw opens to judge subject lines." },
    { q: "Which campaign types earn more than they cost?", data: "Campaigns (Actual_Spend_INR), Orders (attributed, Delivered)", kpi: "Email ROI %, ROAS",
      analysis: "Sum Delivered-order revenue per campaign through Attributed_Campaign_ID and compare with spend.",
      insight: `Overall ROI is ${A.roi}% (ROAS ${A.roas}) on ${inr(A.spend)} spend. Cart Abandonment returns ${Math.round(ty("Cart Abandonment", "roi"))}% and Loyalty ${Math.round(ty("Loyalty", "roi"))}%, but Promotional (${Math.round(ty("Promotional", "roi"))}%) and Re-engagement (${Math.round(ty("Re-engagement", "roi"))}%) lose money; ${A.neg_roi_campaigns} of 61 campaigns have negative ROI.`,
      rec: "Shift budget from broad Promotional blasts to triggered flows (cart abandonment, welcome) and loyalty; test Promotional campaigns with a holdout before cutting them." },
    { q: "Are we sending too much?", data: "Emails (Recipients), Activities (Unsubscribe, Open)", kpi: "Unsubscribe Rate, Human Open Rate by year",
      analysis: "Compare 2023 and 2024 volume with unsubscribe and open rates.",
      insight: `Sends grew from ${fmtN(A.year_email["2023"].sent)} to ${fmtN(A.year_email["2024"].sent)} (+${f1((A.year_email["2024"].sent / A.year_email["2023"].sent - 1) * 100)}%). Unsubscribe rate rose from ${A.year_email["2023"].unsub}% to ${A.year_email["2024"].unsub}% and human open rate fell from ${A.year_email["2023"].open}% to ${A.year_email["2024"].open}%.`,
      rec: "Set a frequency cap per subscriber per week and send Promotional emails only to engaged segments." },
    { q: "Do personalised subjects and send time matter?", data: "Emails (Is_Personalised_Subject, Email_Sent_Date), Activities", kpi: "Human Open Rate by subject type and send time",
      analysis: "Split human open rate by personalisation and by Morning / Afternoon / Evening send.",
      insight: `Personalised subjects open at ${MD.open_by_pers ? MD.open_by_pers[1][1] : 35.9}% vs ${MD.open_by_pers ? MD.open_by_pers[0][1] : 30.6}% generic. Morning sends (8–11) open best at ${MD.open_by_time ? MD.open_by_time[0][1] : 34.5}%.`,
      rec: "Make {{FirstName}} personalisation the default and schedule promotional sends for 8–11 am; confirm with an A/B test." },
    { q: "Where does web traffic come from, and which source converts?", data: "Web_Engagement (Traffic_Source, Sessions, Conversions)", kpi: "Traffic Source share, Conversion Rate by source",
      analysis: "Sum sessions by source (not row counts) and compute conversions ÷ sessions.",
      insight: `Organic Search brings ${SRCP("Organic Search")[1]}% of sessions and Google Ads ${SRCP("Google Ads")[1]}%, but Email converts best (${MD.src_cvr ? MD.src_cvr.find(x => x[0] === "Email")[1] : 3.71}%) and Instagram worst (${MD.src_cvr ? MD.src_cvr.find(x => x[0] === "Instagram")[1] : 0.5}%, with ${MD.src_bounce ? MD.src_bounce.find(x => x[0] === "Instagram")[1] : 68}% bounce). Counting rows would have shown 12.5% for every source.`,
      rec: "Use email to drive high-intent traffic; fix Social landing pages before adding social spend." },
    { q: "Is mobile hurting conversion?", data: "Web_Engagement (Device_Type)", kpi: "Device share, Conversion Rate by device",
      analysis: "Session share and conversion rate by device.",
      insight: `Mobile is ${MD.device_pct ? MD.device_pct[0][1] : 64}% of sessions but converts at ${MD.device_cvr ? MD.device_cvr[1][1] : 1.51}% vs ${MD.device_cvr ? MD.device_cvr[0][1] : 2.32}% on desktop and ${MD.device_cvr ? MD.device_cvr[2][1] : 1.88}% on tablet.`,
      rec: "Prioritise mobile checkout (UPI one-tap, fewer steps); even half the desktop gap on 64% of traffic is a large revenue gain." },
    { q: "Are our web KPIs calculated correctly?", data: "Web_Engagement", kpi: "Bounce Rate, Session Duration, Unique Visitors",
      analysis: "Compare simple averages and sums with session-weighted values.",
      insight: `Bounce rate is ${A.bounce_weighted}% weighted vs ${A.bounce_avg}% averaged; duration ${A.dur_weighted} vs ${A.dur_avg} min. Summed 'unique visitors' (${mil(A.uv_sum)}) are visitor-days, not people.`,
      rec: "Publish the weighted versions, rename the summed visitors 'visitor-days', and add a definitions panel to the dashboard." },
    { q: "Is our email list healthy?", data: "Activities (Bounced, Delivered), Customers (Unsubscribe_Date)", kpi: "Bounce Rate, Hard Bounces, sends after unsubscribe",
      analysis: "Check repeat hard bounces and deliveries after the unsubscribe date.",
      insight: `Bounce rate is a healthy ${A.bounce_rate}%, but ${A.repeat_hard_bounce_customers} of ${A.hard_bounce_customers} hard-bounced customers were mailed again and ${A.sends_after_unsub} emails went out after an unsubscribe.`,
      rec: "Suppress hard bounces and unsubscribes in real time before each send and add a pre-send check to the campaign checklist." },
    { q: "Facebook or Instagram: where should social budget go?", data: "Social_Ads_Daily, Campaigns", kpi: "CTR, CPC, Engagement Rate, ROAS, Ad Profit",
      analysis: "Compare platforms on engagement and on money metrics; subtract product cost to get ad profit.",
      insight: `Instagram gets the higher engagement rate (${P_("Instagram", "er")}% vs ${P_("Facebook", "er")}%) but Facebook wins on CTR (${P_("Facebook", "ctr")}% vs ${P_("Instagram", "ctr")}%), CPC (₹${P_("Facebook", "cpc")} vs ₹${P_("Instagram", "cpc")}) and ROAS (${P_("Facebook", "roas")} vs ${P_("Instagram", "roas")}). After product cost Facebook ads make ${inrL(P_("Facebook", "profit"))} and Instagram loses ${inrL(-P_("Instagram", "profit"))}. Retargeting returns ${MD.soc_type_roas ? MD.soc_type_roas[0][1] : ""}× while awareness video returns under 0.3×.`,
      rec: "Move conversion budget to Facebook catalogue retargeting; keep Instagram Reels for launches and judge them on reach and cost per engagement, not ROAS." },
    { q: "Is WhatsApp worth scaling?", data: "WhatsApp_Messages, Orders (Attributed_Channel = WhatsApp), Customers", kpi: "Delivery, Read, Click rate, Opt-out, ROI",
      analysis: "Funnel from sent to ordered; ROI on message cost + creative; check opt-outs.",
      insight: `${fmtN(W_("sent"))} messages: ${W_("delivery_rate")}% delivered, ${W_("read_rate")}% read, ${W_("click_rate")}% clicked, ${W_("optout_rate")}% opted out. ${fmtN(W_("orders"))} delivered orders worth ${inrL(W_("revenue"))} on ${inrL(W_("spend"))} spend: ROI ${W_("roi")}%. Only ${fmtN(W_("opted_in"))} customers are opted in.`,
      rec: "Grow WhatsApp opt-ins (checkout tick-box, order updates), keep to 2–3 marketing messages a month and watch opt-outs, especially on Re-engagement." },
    { q: "How do channels compare on return?", data: "Campaigns, Orders, Social_Ads_Daily", kpi: "Spend, Revenue, ROAS by channel",
      analysis: "Email & WhatsApp revenue from Orders (last click); Facebook & Instagram from Meta's reports. Label the source.",
      insight: Object.entries(A.channels || {}).map(([k, v]) => `${k}: spend ${inrL(v.spend)}, revenue ${inrL(v.revenue)}, ROAS ${v.roas}`).join("; ") + ". Facebook and Instagram figures are platform-reported, so they're not on the same scale as Email and WhatsApp.",
      rec: "Fund owned channels (Email, WhatsApp) first, since they are cheap and measured on real orders; scale Meta only where profit, not just ROAS, is positive." },
  ];
}

/* ---------------- ORIGINAL BLOCKS ---------------- */
const TOOLS = M_TOOLS;
const DOMAIN_WHAT = M_DOMAIN_WHAT;
const DOMAIN_WHERE = M_DOMAIN_WHERE;
const DOMAIN_DATA_TYPES = M_DOMAIN_DATA_TYPES;
const FLOW = M_FLOW;
const TIMELINE = M_TIMELINE;
const RULES = M_RULES;
const FOCUS_AREAS = M_FOCUS_AREAS;
const SOCIAL = M_SOCIAL;
const SETUP_STEPS = [
  { i: "⬇️", t: "Get the dataset", d: "AXon_Marketing_Data.xlsx (README + Data_Dictionary + Integrity_Report + 9 data sheets) or the 9 CSV files." },
  { i: "🗄️", t: "Import into MySQL", d: "Create the tables, load Dim_Date, Campaigns and Customers first, then Emails, Activities, WhatsApp_Messages, Social_Ads_Daily, Orders and Web_Engagement. Use LOAD DATA for the big tables." },
  { i: "✅", t: "Verify the load", d: "Row counts must match the Dataset page (Activities 313,895; WhatsApp_Messages 73,221; Social_Ads_Daily 41,736; Web_Engagement 70,080)." },
  { i: "📊", t: "Connect BI tools", d: "Point Tableau and Power BI at MySQL, not at the Excel file." },
];
const SOFTWARE_LINKS = M_SOFTWARE_LINKS;
const DOCUMENTS = M_DOCUMENTS;

/* ---------------- DATASET ---------------- */
const COVERAGE_TEXT = `Two full years: 1-Jan-2023 to 31-Dec-2024 (Dim_Date: 762 days to 31-Jan-2025 so late January events still join, with Year_Month, ISO week, weekend flag, Indian fiscal year and a Diwali festive-season flag). AXon Retail is a fictional Indian online fashion & lifestyle retailer. The email side follows the original project structure (Campaigns → Emails → Activities) at recipient level: ${fmtN(A.sent)} emails sent in 471 sends of 61 campaigns to 12,000 subscribers. Facebook and Instagram ad results come day by day in Social_Ads_Daily (Meta Ads Manager export) and WhatsApp template messages in WhatsApp_Messages. Orders (${fmtN(A.orders)}) carry last-click Email/WhatsApp attribution (72 hours). Web_Engagement covers ALL site visitors at day × source × device × region grain; 2024-03-12 is missing (tracking outage). Money is in ₹.`;
const STORY = [
  ["Every send", "Opens look better than they are", `${f1(A.machine_open_share)}% of opens are Apple Mail machine opens; many more are repeats`, "Human open rate card, Open rate by email client"],
  ["Always on", "Cart Abandonment carries email revenue", `${Math.round(TT["Cart Abandonment"] ? TT["Cart Abandonment"].roi : 1786)}% ROI on ${inr(TT["Cart Abandonment"] ? TT["Cart Abandonment"].Actual_Spend_INR : 89600)} spend`, "ROI by campaign type"],
  ["2024", "More email, more unsubscribes", `Sends +${f1((A.year_email["2024"].sent / A.year_email["2023"].sent - 1) * 100)}%, unsubscribe rate ${A.year_email["2023"].unsub}% → ${A.year_email["2024"].unsub}%`, "Unsubscribe trend"],
  ["Oct–Nov", "Diwali drives traffic", `Festive-season days get +${f1(A.festive_lift)}% sessions; peak month Oct 2024`, "Engagement by date"],
  ["Every visit", "Mobile browses, desktop buys", `Mobile ${MD.device_pct ? MD.device_pct[0][1] : 64}% of sessions, CVR ${MD.device_cvr ? MD.device_cvr[1][1] : 1.51}% vs ${MD.device_cvr ? MD.device_cvr[0][1] : 2.32}% desktop`, "Device share and CVR"],
  ["12-Mar-2024", "A day is missing", "Tracking outage: no web rows for 2024-03-12", "Engagement by date (gap)"],
  ["Every campaign", "Likes ≠ profit", `Instagram ER ${P_("Instagram", "er")}% vs Facebook ${P_("Facebook", "er")}%, but ROAS ${P_("Instagram", "roas")} vs ${P_("Facebook", "roas")}`, "Social platform comparison"],
  ["Every broadcast", "WhatsApp gets read", `${W_("read_rate")}% read rate, ${W_("roi")}% ROI on a small opted-in base`, "WhatsApp funnel"],
];
const TABLE_TYPES = { "Campaigns": "Dimension", "Emails": "Fact", "Activities": "Fact", "WhatsApp_Messages": "Fact", "Social_Ads_Daily": "Fact", "Customers": "Dimension", "Orders": "Fact", "Web_Engagement": "Fact", "Dim_Date": "Dimension" };
const TABLE_SRC = { "WhatsApp_Messages": "WhatsApp_Messages", "Social_Ads_Daily": "Social_Ads_Daily", "Campaigns": "Campaigns", "Emails": "Emails", "Activities": "Activities", "Customers": "Customers", "Orders": "Orders", "Web_Engagement": "Web_Engagement", "Dim_Date": "Dim_Date" };
const TABLE_PK = { "WhatsApp_Messages": "Message_ID", "Social_Ads_Daily": "Ad_Row_ID (grain: Date, Campaign_ID, Ad_Format, City, Device_Type)", "Campaigns": "Campaign_ID", "Emails": "Email_ID", "Activities": "Activity_ID", "Customers": "Customer_ID", "Orders": "Order_ID", "Web_Engagement": "(Date, Traffic_Source, Device_Type, Region)", "Dim_Date": "Date" };
const TABLE_FK = { "WhatsApp_Messages": "Campaign_ID, Customer_ID", "Social_Ads_Daily": "Campaign_ID (+ Date × Platform × Device × Region ↔ Web_Engagement)", "Emails": "Campaign_ID", "Activities": "Email_ID, Customer_ID", "Orders": "Customer_ID, Attributed_Campaign_ID, Attributed_Email_ID, Attributed_Message_ID", "Web_Engagement": "Date only" };
const TABLE_GRAIN = { "WhatsApp_Messages": "1 row per message (final status)", "Social_Ads_Daily": "1 row per day × campaign × ad format × city × device", "Campaigns": "1 row per campaign", "Emails": "1 row per email send", "Activities": "1 row per recipient event (repeat opens/clicks possible)", "Customers": "1 row per subscriber", "Orders": "1 row per order", "Web_Engagement": "1 row per day × source × device × region", "Dim_Date": "1 row per day (762)" };
const TABLE_DATE = { "WhatsApp_Messages": "Sent_Time, Delivered_Time, Read_Time, Click_Time", "Social_Ads_Daily": "Date", "Campaigns": "Start_Date, End_Date", "Emails": "Email_Sent_Date", "Activities": "Activity_Date (datetime)", "Customers": "Signup_Date, Unsubscribe_Date", "Orders": "Order_Date", "Web_Engagement": "Date", "Dim_Date": "Date, Year_Month, Week_Num, Festive_Season" };
const TABLE_PURPOSE = {
  "WhatsApp_Messages": ["Every WhatsApp template message with its final status, read, click, reply, opt-out and cost.", "The WhatsApp funnel and ROI; orders attribute back through Attributed_Message_ID."],
  "Social_Ads_Daily": ["Daily Facebook and Instagram ad results by campaign, format, city and device (Meta Ads Manager export).", "Spend, impressions, clicks, likes, comments, shares, purchases and ROAS per platform."],
  "Campaigns": ["All 103 campaigns across Email, Facebook, Instagram and WhatsApp: type, dates, budget, actual spend, UTM codes.", "Every ROI number needs Actual_Spend_INR from here; Channel decides which fact table holds the events."],
  "Emails": ["Each send of a campaign, with subject, send time, A/B variant and recipients.", "The bridge between campaigns and events; Recipients is the denominator of Delivery Rate."],
  "Activities": ["Every Delivered, Bounced, Open, Click, Unsubscribe and Spam Complaint event per recipient.", "All email engagement KPIs come from here, and its repeat rows are the main trap."],
  "Customers": ["The 12,000 subscribers: region, email client, loyalty tier, opt-in status.", "Explains Apple Mail machine opens and lets you segment engagement and revenue."],
  "Orders": ["Subscriber orders with status, product cost, coupon and last-click Email/WhatsApp attribution.", "Turns engagement into revenue and profit: ROI, ROAS, conversion, gross margin."],
  "Web_Engagement": ["Daily website traffic by source, device and region for all visitors.", "The whole web dashboard: sessions, bounce, duration, conversion, ad spend."],
  "Dim_Date": ["The calendar 2023-01-01 → 2025-01-31 with month, week, fiscal year, Diwali window and a reporting-period flag.", "One date axis for every fact table; covers late January events so no date is orphaned."],
};
const RELATIONSHIPS = M_RELATIONSHIPS;
const LOAD_ORDER = M_LOAD_ORDER;
const CALC_FIELDS = M_CALC_FIELDS;
const GOTCHAS = M_GOTCHAS;
const GLOBAL_FILTERS = M_GLOBAL_FILTERS;
const DASHBOARDS = M_DASHBOARDS;
const NULL_NOTES = [
  "Campaigns.End_Date is NULL for 2 always-on campaigns (Cart Abandonment Reminders and Welcome Series 2024). Treat NULL as 'still running', not missing.",
  "Activities.Bounce_Type is filled only on Bounced rows, Link_Name only on Click rows, Device_Type only on Open and Click rows. Blanks elsewhere are by design.",
  "Emails.AB_Variant is blank for 441 of 471 sends: only 15 subject-line tests (A and B) were run.",
  "Orders.Attributed_Email_ID / Attributed_Campaign_ID are NULL for orders not preceded by an email click in the last 72 hours. That's most orders, and it's correct.",
  "Customers.Unsubscribe_Date is NULL for subscribed customers; Email_Opt_In = 'No' for those who unsubscribed.",
  `${A.acts_after_calendar || 36} activities (and some WhatsApp reads) happen in January 2025, after the reporting period. Dim_Date runs to 2025-01-31 so they still join; filter Is_Reporting_Period = 'Yes' for 2023–2024 totals.`,
  "Web_Engagement has no row for 2024-03-12 (tracking outage): 730 days of data in 2023–2024 instead of 731. Don't fill it with zeros.",
  "WhatsApp_Messages.Failure_Reason is filled only for Failed messages; Delivered_Time is NULL for them, Read_Time is NULL for messages not read, Click_Time only when Button_Clicked = Yes.",
  "Social_Ads_Daily.Video_Views_3s is 0 for Image, Carousel and Collection ads (no video). Reels and Stories exist only on Instagram, Collection only on Facebook.",
  "Orders.Coupon_Code is NULL when there was no discount; Attributed_Email_ID and Attributed_Message_ID are filled only for their own channel.",
  "Activities has several Open/Click rows for the same recipient and email (repeat opens) and Apple Mail opens a few seconds after delivery (machine opens). Real behaviour, not duplicates to delete.",
];
const DQ_RULES = [
  ["Row counts", "COUNT(*) per table matches the Dataset page", "All 9 tables", "Critical"],
  ["Key uniqueness", "No duplicate Campaign_ID, Email_ID, Activity_ID, Customer_ID, Order_ID", "All tables", "Critical"],
  ["Referential integrity", "Every Email has a Campaign, every Activity an Email and a Customer", "Emails, Activities, Orders", "Critical"],
  ["Send reconciliation", "Recipients = Delivered + Bounced rows per email", "Emails vs Activities", "High"],
  ["Date logic", "Activity_Date ≥ Email_Sent_Date; sends inside the campaign window", "Activities, Emails", "High"],
  ["Activity domain", "Activity_Type ∈ {Delivered, Bounced, Open, Click, Unsubscribe, Spam Complaint}", "Activities", "High"],
  ["Suppression", "No Delivered row after Unsubscribe_Date; no repeat hard bounce", "Activities, Customers", "High"],
  ["Web additivity", "Bounced_Sessions ≤ Sessions; Unique_Visitors ≤ Sessions", "Web_Engagement", "Medium"],
  ["Calendar coverage", "Every Web date present (one known gap); activities inside Dim_Date", "Web_Engagement, Dim_Date", "Medium"],
  ["Revenue rule", "Revenue uses Delivered orders only", "Orders", "High"],
  ["Channel consistency", "Social_Ads_Daily.Platform = Campaigns.Channel; WhatsApp only on WhatsApp campaigns", "Social_Ads_Daily, WhatsApp_Messages", "Critical"],
  ["Spend reconciliation", "Campaigns.Actual_Spend = SUM(daily ad spend); Meta spend = Web Ad_Spend by day", "Campaigns, Social_Ads_Daily, Web_Engagement", "High"],
  ["Consent", "No WhatsApp message before WhatsApp_Opt_In_Date", "WhatsApp_Messages, Customers", "Critical"],
  ["Status sequence", "Sent ≤ Delivered ≤ Read ≤ Click", "WhatsApp_Messages", "Medium"],
];
const INTERVIEW_TRAPS = [
  ["Open rate = Open rows ÷ Delivered", "Unique openers ÷ Delivered, and remove machine opens"],
  ["Delivery rate = delivered ÷ number of emails", "Delivered ÷ Recipients (same unit top and bottom)"],
  ["CTR = clicks ÷ opens", "CTR = unique clickers ÷ delivered; CTOR = clickers ÷ openers"],
  ["Total unique visitors = SUM(Unique_Visitors)", "That's visitor-days; distinct people need visitor-level data"],
  ["Avg bounce rate = AVERAGE(Bounce_Rate_Pct)", "SUM(Bounced_Sessions) ÷ SUM(Sessions)"],
  ["Source share = count of rows", "Sum Sessions: rows are equal for every source"],
  ["Revenue = SUM of all orders", "Delivered orders only; returns and cancellations aren't revenue"],
  ["Best campaign = most activities", "Agree the metric: CTR, conversion or ROI"],
  ["Instagram is best: most likes", "Judge on ROAS and profit; engagement ≠ revenue"],
  ["WhatsApp delivered = status 'Delivered'", "Delivered + Read (status is the last state)"],
  ["Total reach = SUM(Reach)", "Reach is de-duplicated per row; summing double-counts"],
  ["Add Meta purchase value to Orders revenue", "Different attribution sources: label, don't add"],
];
const PRESENTATION = [
  ["01", "Group Details", "15 sec", "Team members and who owned Excel, SQL, Tableau, Power BI and QA."],
  ["02", "Summary", "30 sec", "AXon's problem, the 7-table dataset, what you built."],
  ["03", "KPI List", "45 sec", "The 15 KPI-document KPIs (with the corrected formulas) + key extended KPIs."],
  ["04", "Excel Dashboard", "30 sec", "KPIs and pivots in Excel."],
  ["05", "Tableau Dashboard", "60 sec", "Email Campaign and Web Engagement pages."],
  ["06", "Power BI Dashboard", "60 sec", "Same pages in Power BI, reconciled."],
  ["07", "SQL Query Image", "30 sec", "Screenshot of the KPI queries and the vw_email_performance view."],
  ["08", "Key Takeaway", "45 sec", `Human open ${A.human_open_rate}%, email ROI ${A.roi}%, Facebook ROAS ${P_("Facebook", "roas")} vs Instagram ${P_("Instagram", "roas")}, WhatsApp ROI ${W_("roi")}%, mobile converts less.`],
];
/* ---------------- SQL LAB (MySQL) ---------------- */
const VW_EMAIL = `CREATE OR REPLACE VIEW vw_email_performance AS
WITH dlv AS (            -- one Delivered row per recipient per email
  SELECT email_id, customer_id, activity_date AS delivered_at
  FROM activities WHERE activity_type = 'Delivered'
),
openers AS (             -- one row per (email, customer) who opened
  SELECT a.email_id, a.customer_id,
         MAX(TIMESTAMPDIFF(SECOND, d.delivered_at, a.activity_date) >= 15) AS is_human
  FROM activities a
  JOIN dlv d ON d.email_id = a.email_id AND d.customer_id = a.customer_id
  WHERE a.activity_type = 'Open'
  GROUP BY a.email_id, a.customer_id
),
ev AS (
  SELECT email_id,
         SUM(activity_type = 'Delivered')       AS delivered,
         SUM(activity_type = 'Bounced')         AS bounced,
         SUM(activity_type = 'Open')            AS total_opens,
         SUM(activity_type = 'Click')           AS total_clicks,
         COUNT(DISTINCT CASE WHEN activity_type = 'Click' THEN customer_id END) AS unique_clicks,
         SUM(activity_type = 'Unsubscribe')     AS unsubscribes,
         SUM(activity_type = 'Spam Complaint')  AS spam_complaints
  FROM activities GROUP BY email_id
),
op AS (
  SELECT email_id, COUNT(*) AS unique_opens, SUM(is_human) AS human_unique_opens
  FROM openers GROUP BY email_id
)
SELECT e.email_id, e.campaign_id, c.campaign_name, c.campaign_type,
       e.email_sent_date, YEAR(e.email_sent_date) AS sent_year, e.recipients,
       ev.delivered, ev.bounced, ev.total_opens,
       COALESCE(op.unique_opens, 0)       AS unique_opens,
       COALESCE(op.human_unique_opens, 0) AS human_unique_opens,
       ev.total_clicks, ev.unique_clicks, ev.unsubscribes, ev.spam_complaints
FROM emails e
JOIN campaigns c ON c.campaign_id = e.campaign_id
LEFT JOIN ev ON ev.email_id = e.email_id
LEFT JOIN op ON op.email_id = e.email_id;
-- 471 rows. SUM(delivered) 174,058 · SUM(unique_opens) 79,060 · SUM(unique_clicks) 11,407`;

const VW_ROI = `CREATE OR REPLACE VIEW vw_campaign_roi AS
SELECT c.campaign_id, c.campaign_name, c.campaign_type, c.actual_spend_inr,
       COUNT(o.order_id)                  AS attributed_orders,
       COALESCE(SUM(o.net_revenue_inr), 0) AS attributed_revenue,
       ROUND(100 * (COALESCE(SUM(o.net_revenue_inr), 0) - c.actual_spend_inr)
                 / c.actual_spend_inr, 1)  AS roi_pct
FROM campaigns c
LEFT JOIN orders o
       ON o.attributed_campaign_id = c.campaign_id
      AND o.order_status = 'Delivered'          -- in the ON clause, not WHERE
GROUP BY c.campaign_id, c.campaign_name, c.campaign_type, c.actual_spend_inr;
-- 61 rows. SUM(actual_spend_inr) 1,926,200 · SUM(attributed_revenue) 3,985,458`;

const SQL_BLOCKS = [
  { cat: "Setup", title: "1 · Create the tables (MySQL)", desc: "Dimensions first. Activities, Orders and Web_Engagement are the big ones.",
    sql: "CREATE DATABASE axon_marketing;\nUSE axon_marketing;\n\nCREATE TABLE dim_date (date DATE PRIMARY KEY, year INT, quarter VARCHAR(2), month_num INT, month_name VARCHAR(3),\n  year_month CHAR(7), week_num INT, day_name VARCHAR(10), is_weekend VARCHAR(3), fiscal_year VARCHAR(10), festive_season VARCHAR(3));\nCREATE TABLE campaigns (campaign_id VARCHAR(10) PRIMARY KEY, campaign_name VARCHAR(80), campaign_type VARCHAR(30), objective VARCHAR(20),\n  channel VARCHAR(10), target_segment VARCHAR(40), product_category VARCHAR(40), start_date DATE, end_date DATE NULL,\n  budget_inr INT, actual_spend_inr INT, discount_offer_pct INT, campaign_manager VARCHAR(40));\nCREATE TABLE customers (customer_id VARCHAR(12) PRIMARY KEY, signup_date DATE, city VARCHAR(40), state VARCHAR(40), region VARCHAR(10),\n  age_band VARCHAR(10), gender VARCHAR(10), acquisition_channel VARCHAR(30), email_client VARCHAR(20), loyalty_tier VARCHAR(10),\n  email_opt_in VARCHAR(3), unsubscribe_date DATETIME NULL);\nCREATE TABLE emails (email_id VARCHAR(12) PRIMARY KEY, campaign_id VARCHAR(10), email_subject VARCHAR(120), email_sent_date DATETIME,\n  email_sequence INT, ab_variant VARCHAR(2), audience_segment VARCHAR(40), recipients INT, is_personalised_subject VARCHAR(3), subject_length INT,\n  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id));\nCREATE TABLE activities (activity_id VARCHAR(12) PRIMARY KEY, email_id VARCHAR(12), customer_id VARCHAR(12), activity_type VARCHAR(20),\n  activity_date DATETIME, bounce_type VARCHAR(5) NULL, link_name VARCHAR(40) NULL, device_type VARCHAR(10) NULL,\n  INDEX (email_id), INDEX (customer_id), INDEX (activity_type));\nCREATE TABLE orders (order_id VARCHAR(12) PRIMARY KEY, customer_id VARCHAR(12), order_date DATETIME, product_category VARCHAR(40), units INT,\n  gross_amount_inr DECIMAL(12,2), discount_inr DECIMAL(12,2), net_revenue_inr DECIMAL(12,2), order_channel VARCHAR(10), payment_mode VARCHAR(20),\n  order_status VARCHAR(10), attributed_email_id VARCHAR(12) NULL, attributed_campaign_id VARCHAR(10) NULL);\nCREATE TABLE web_engagement (date DATE, traffic_source VARCHAR(20), device_type VARCHAR(10), region VARCHAR(10), sessions INT, unique_visitors INT,\n  new_visitors INT, page_views INT, bounced_sessions INT, bounce_rate_pct DECIMAL(5,2), avg_session_duration_min DECIMAL(5,2), conversions INT,\n  revenue_inr DECIMAL(14,2), ad_spend_inr DECIMAL(14,2), PRIMARY KEY (date, traffic_source, device_type, region));\nCREATE TABLE whatsapp_messages (message_id VARCHAR(12) PRIMARY KEY, campaign_id VARCHAR(10), customer_id VARCHAR(12), template_name VARCHAR(40),\n  sent_time DATETIME, message_status VARCHAR(10), failure_reason VARCHAR(40) NULL, delivered_time DATETIME NULL, read_time DATETIME NULL,\n  button_clicked VARCHAR(3), click_time DATETIME NULL, replied VARCHAR(3), opted_out VARCHAR(3), cost_inr DECIMAL(6,2),\n  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id), FOREIGN KEY (customer_id) REFERENCES customers(customer_id));\nCREATE TABLE social_ads_daily (ad_row_id VARCHAR(10) PRIMARY KEY, date DATE, campaign_id VARCHAR(10), platform VARCHAR(10), ad_format VARCHAR(12),\n  city VARCHAR(20), region VARCHAR(10), device_type VARCHAR(10), impressions INT, reach INT, link_clicks INT, landing_page_views INT, add_to_cart INT,\n  likes INT, comments INT, shares INT, saves INT, video_views_3s INT, spend_inr DECIMAL(12,2), purchases INT, purchase_value_inr DECIMAL(14,2),\n  purchase_gross_margin_inr DECIMAL(14,2), UNIQUE (date, campaign_id, ad_format, city, device_type),\n  FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id));\n-- Campaigns also has channel, utm_source, utm_campaign; Customers has whatsapp_opt_in, whatsapp_opt_in_date; Orders has product_cost_inr,\n-- coupon_code, attributed_channel and attributed_message_id (see the Data Dictionary)\n\n-- Activities (313,895 rows): LOAD DATA is far faster than the import wizard\nLOAD DATA LOCAL INFILE 'Activities.csv' INTO TABLE activities\nFIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' IGNORE 1 LINES\n(activity_id, email_id, customer_id, activity_type, activity_date, @b, @l, @d)\nSET bounce_type = NULLIF(@b,''), link_name = NULLIF(@l,''), device_type = NULLIF(@d,'');" },
  { cat: "Setup", title: "2 · Verify the load: row counts", desc: "Every count must match before you build anything.", sql: M_SQL_BLOCKS[0].sql },
  { cat: "KPI", title: "3 · Delivery rate — and why the KPI document's version isn't a rate", desc: "Same unit on top and bottom.",
    sql: "SELECT SUM(recipients) AS sent FROM emails;                               -- 177,032\n\nSELECT SUM(activity_type = 'Delivered') AS delivered,                      -- 174,058\n       SUM(activity_type = 'Bounced')   AS bounced,                        -- 2,974\n       ROUND(100 * SUM(activity_type = 'Delivered')\n             / (SELECT SUM(recipients) FROM emails), 2) AS delivery_rate   -- 98.32\nFROM activities;\n\n-- KPI-document formula: delivered activities ÷ unique emails\nSELECT ROUND(SUM(activity_type = 'Delivered') / COUNT(DISTINCT email_id), 1) AS doc_value   -- 369.5 (per email, not %)\nFROM activities;" },
  { cat: "KPI", title: "4 · Open rate three ways: total, unique, human", desc: "COUNT DISTINCT on (email, customer); then remove Apple Mail machine opens.",
    sql: "SELECT ROUND(100 * SUM(activity_type = 'Open') / SUM(activity_type = 'Delivered'), 2) AS total_open_rate,   -- 69.48 (repeat opens)\n       ROUND(100 * COUNT(DISTINCT CASE WHEN activity_type = 'Open'\n                                   THEN CONCAT(email_id, '|', customer_id) END)\n                 / SUM(activity_type = 'Delivered'), 2)                               AS unique_open_rate   -- 45.42\nFROM activities;\n\n-- human opens: an open ≥ 15 seconds after that recipient's delivery\nSELECT ROUND(100 * SUM(human_unique_opens) / SUM(delivered), 2) AS human_open_rate   -- 31.58\nFROM vw_email_performance;" },
  { cat: "KPI", title: "5 · CTR, CTOR, unsubscribe and spam rates", desc: "Unique clickers, not click rows.",
    sql: "SELECT ROUND(100 * SUM(total_clicks)  / SUM(total_opens), 2)  AS doc_ctr,      -- 12.76 (clicks ÷ opens, rows)\n       ROUND(100 * SUM(unique_clicks) / SUM(delivered), 2)    AS unique_ctr,   -- 6.55\n       ROUND(100 * SUM(unique_clicks) / SUM(unique_opens), 2) AS ctor,         -- 14.43\n       ROUND(100 * SUM(unsubscribes)  / SUM(delivered), 3)    AS unsub_rate,   -- 0.267\n       ROUND(100 * SUM(spam_complaints) / SUM(delivered), 3)  AS spam_rate     -- 0.020\nFROM vw_email_performance;" },
  { cat: "KPI", title: "6 · Activity breakdown, campaign engagement rate, avg activity per email", desc: "The KPI document's campaign KPIs. SUM() OVER () = ALL().",
    sql: "SELECT activity_type, COUNT(*) AS n,\n       ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct\nFROM activities GROUP BY activity_type ORDER BY n DESC;\n-- Delivered 174,058 · Open 120,932 · Click 15,432 · Bounced 2,974 · Unsubscribe 465 · Spam Complaint 34\n\nSELECT c.campaign_name, COUNT(*) AS activities,\n       ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS engagement_rate_pct\nFROM activities a JOIN emails e ON e.email_id = a.email_id JOIN campaigns c ON c.campaign_id = e.campaign_id\nGROUP BY c.campaign_name ORDER BY activities DESC LIMIT 5;\n-- Cart Abandonment Reminders 31,813 (10.1) · Diwali Mega Sale 2024 13,585 · Diwali Mega Sale 2023 10,782 ...\n\nSELECT ROUND(COUNT(*) / COUNT(DISTINCT email_id), 1) AS avg_activity_per_email FROM activities;   -- 666.4" },
  { cat: "KPI", title: "7 · Email sent vs activity timeline", desc: "Monthly sends next to monthly activity.",
    sql: "SELECT DATE_FORMAT(e.email_sent_date, '%Y-%m') AS ym, SUM(e.recipients) AS sent\nFROM emails e GROUP BY ym ORDER BY ym;\n\nSELECT DATE_FORMAT(activity_date, '%Y-%m') AS ym, COUNT(*) AS activities\nFROM activities GROUP BY ym ORDER BY ym;   -- note: 2025-01 has 36 late opens (Dim_Date runs to 2025-01-31, so they still join)" },
  { cat: "Mart view", title: "8 · The email mart view (vw_email_performance)", desc: "One row per email; every email KPI becomes SUM ÷ SUM. Both BI tools read this view.", sql: VW_EMAIL },
  { cat: "Mart view", title: "9 · Campaign ROI view (vw_campaign_roi)", desc: "Revenue = Delivered orders attributed to the campaign.", sql: VW_ROI },
  { cat: "Breakdown", title: "10 · ROI, open rate and CTR by campaign type", desc: "Join the two views on campaign.",
    sql: "WITH em AS (SELECT campaign_type, SUM(delivered) d, SUM(unique_opens) uo, SUM(unique_clicks) uc, SUM(unsubscribes) un\n            FROM vw_email_performance GROUP BY campaign_type),\n     r AS (SELECT campaign_type, SUM(actual_spend_inr) spend, SUM(attributed_revenue) rev\n           FROM vw_campaign_roi GROUP BY campaign_type)\nSELECT em.campaign_type,\n       ROUND(100 * uo / d, 1) AS open_rate, ROUND(100 * uc / d, 1) AS ctr, ROUND(100 * un / d, 2) AS unsub_rate,\n       spend, rev, ROUND(100 * (rev - spend) / spend) AS roi_pct\nFROM em JOIN r ON r.campaign_type = em.campaign_type ORDER BY roi_pct DESC;\n-- Cart Abandonment 1786 · Loyalty 641 · Welcome 162 · Festive 36 · Newsletter 28 · Product Launch 25 · Promotional -9 · Re-engagement -49" },
  { cat: "Breakdown", title: "11 · Personalisation, send time and email client", desc: "Human open rate by segment.",
    sql: "SELECT e.is_personalised_subject, ROUND(100 * SUM(v.human_unique_opens) / SUM(v.delivered), 1) AS human_open\nFROM vw_email_performance v JOIN emails e ON e.email_id = v.email_id GROUP BY 1;   -- Yes 35.9 · No 30.6\n\nSELECT CASE WHEN HOUR(email_sent_date) < 12 THEN 'Morning' WHEN HOUR(email_sent_date) < 17 THEN 'Afternoon' ELSE 'Evening' END AS band,\n       ROUND(100 * SUM(human_unique_opens) / SUM(delivered), 1) AS human_open\nFROM vw_email_performance GROUP BY band;   -- Morning 33.4 · Afternoon 29.7 · Evening 29.7" },
  { cat: "Web", title: "12 · Web KPIs: weighted vs naive", desc: "The KPI document's web formulas next to the correct ones.",
    sql: "SELECT SUM(sessions)                                              AS sessions,          -- 15,885,884\n       SUM(unique_visitors)                                       AS uv_sum,            -- 12,575,861 (visitor-days)\n       ROUND(100 * SUM(bounced_sessions) / SUM(sessions), 2)      AS bounce_weighted,   -- 49.04\n       ROUND(AVG(bounce_rate_pct), 2)                             AS bounce_avg,        -- 44.29 ✗\n       ROUND(SUM(sessions * avg_session_duration_min) / SUM(sessions), 2) AS dur_weighted, -- 5.65\n       ROUND(AVG(avg_session_duration_min), 2)                    AS dur_avg,           -- 5.49 ✗\n       ROUND(100 * SUM(conversions) / SUM(sessions), 2)           AS cvr                -- 1.81\nFROM web_engagement;" },
  { cat: "Web", title: "13 · Traffic source, device and region", desc: "Sum sessions; row counts give 12.5% / 33.3% to everyone.",
    sql: "SELECT traffic_source,\n       ROUND(100 * SUM(sessions) / SUM(SUM(sessions)) OVER (), 1) AS session_share,   -- Organic 30.6 · Google Ads 23.2 · Direct 15.3 · Facebook 8.3 · Instagram 8.2 ...\n       ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (), 1)           AS row_share,       -- 12.5 for every source ✗\n       ROUND(100 * SUM(conversions) / SUM(sessions), 2)            AS cvr              -- Email 3.71 best · Instagram 0.53 worst\nFROM web_engagement GROUP BY traffic_source ORDER BY session_share DESC;\n\nSELECT device_type, ROUND(100 * SUM(sessions) / SUM(SUM(sessions)) OVER (), 1) AS share,\n       ROUND(100 * SUM(conversions) / SUM(sessions), 2) AS cvr\nFROM web_engagement GROUP BY device_type;   -- Mobile 68.6 / 1.51 · Desktop 26.3 / 2.55 · Tablet 5.1 / 2.09\n\nSELECT region, SUM(unique_visitors) AS uv FROM web_engagement GROUP BY region ORDER BY uv DESC;   -- West first" },
  { cat: "Web", title: "14 · Monthly engagement, YoY and the missing day", desc: "Find the gap before you draw a line chart.",
    sql: "SELECT DATE_FORMAT(date, '%Y-%m') AS ym, SUM(sessions) AS sessions, SUM(conversions) AS conv\nFROM web_engagement GROUP BY ym ORDER BY ym;   -- peak 2024-10: 1,092,797 sessions\n\nSELECT d.date FROM dim_date d LEFT JOIN (SELECT DISTINCT date FROM web_engagement) w ON w.date = d.date\nWHERE w.date IS NULL;   -- 2024-03-12\n\nSELECT ROUND(100 * (SUM(CASE WHEN YEAR(date) = 2024 THEN sessions END)\n                  / SUM(CASE WHEN YEAR(date) = 2023 THEN sessions END) - 1), 1) AS sessions_yoy   -- 21.3\nFROM web_engagement;" },
  { cat: "Social", title: "15 · Facebook vs Instagram: the full scorecard", desc: "Ratios of sums, never averages of row ratios.",
    sql: `SELECT platform,
       ROUND(SUM(spend_inr))                                   AS spend,
       SUM(impressions)                                        AS impressions,
       ROUND(100 * SUM(link_clicks) / SUM(impressions), 2)     AS ctr_pct,
       ROUND(SUM(spend_inr) / SUM(link_clicks), 2)             AS cpc,
       ROUND(1000 * SUM(spend_inr) / SUM(impressions), 2)      AS cpm,
       ROUND(100 * (SUM(likes)+SUM(comments)+SUM(shares)+SUM(saves)) / SUM(impressions), 2) AS engagement_rate,
       SUM(likes) likes, SUM(comments) comments, SUM(shares) shares,
       ROUND(SUM(purchase_value_inr) / SUM(spend_inr), 2)       AS roas,
       ROUND(SUM(purchase_gross_margin_inr) - SUM(spend_inr))  AS ad_profit
FROM social_ads_daily GROUP BY platform;
-- Facebook  ctr ${P_("Facebook", "ctr")} · cpc ${P_("Facebook", "cpc")} · ER ${P_("Facebook", "er")} · ROAS ${P_("Facebook", "roas")} · profit ${P_("Facebook", "profit")}
-- Instagram ctr ${P_("Instagram", "ctr")} · cpc ${P_("Instagram", "cpc")} · ER ${P_("Instagram", "er")} · ROAS ${P_("Instagram", "roas")} · profit ${P_("Instagram", "profit")}` },
  { cat: "Social", title: "16 · ROAS by campaign type, ad format and city", desc: "Where social money works.",
    sql: `SELECT c.campaign_type, ROUND(SUM(s.purchase_value_inr) / SUM(s.spend_inr), 2) AS roas
FROM social_ads_daily s JOIN campaigns c ON c.campaign_id = s.campaign_id
GROUP BY c.campaign_type ORDER BY roas DESC;
-- ${(MD.soc_type_roas || []).map(x => x[0] + " " + x[1]).join(" · ")}

SELECT ad_format, ROUND(100 * SUM(link_clicks) / SUM(impressions), 2) AS ctr,
       ROUND(100 * (SUM(likes)+SUM(comments)+SUM(shares)+SUM(saves)) / SUM(impressions), 2) AS er
FROM social_ads_daily GROUP BY ad_format ORDER BY ctr DESC;

SELECT city, ROUND(SUM(spend_inr)) spend, ROUND(SUM(purchase_value_inr) / SUM(spend_inr), 2) roas
FROM social_ads_daily GROUP BY city ORDER BY roas DESC;` },
  { cat: "WhatsApp", title: "17 · WhatsApp funnel: the 'last status' trap", desc: "A Read message was delivered too.",
    sql: `SELECT COUNT(*)                                                        AS sent,            -- ${fmtN(W_("sent"))}
       SUM(message_status IN ('Delivered','Read'))                     AS delivered,       -- ${fmtN(W_("delivered"))}
       SUM(message_status = 'Delivered')                               AS status_delivered_only, -- ${fmtN(W_("delivered_status_only"))} ✗
       ROUND(100 * SUM(message_status IN ('Delivered','Read')) / COUNT(*), 2) AS delivery_rate,   -- ${W_("delivery_rate")}
       ROUND(100 * SUM(message_status = 'Read') / SUM(message_status IN ('Delivered','Read')), 2) AS read_rate,   -- ${W_("read_rate")}
       ROUND(100 * SUM(button_clicked = 'Yes') / SUM(message_status IN ('Delivered','Read')), 2) AS click_rate,  -- ${W_("click_rate")}
       ROUND(100 * SUM(opted_out = 'Yes') / SUM(message_status IN ('Delivered','Read')), 3)     AS optout_rate, -- ${W_("optout_rate")}
       ROUND(SUM(cost_inr) / SUM(message_status IN ('Delivered','Read')), 2)                     AS cost_per_delivered -- ${W_("cost_per_delivered")}
FROM whatsapp_messages;

SELECT failure_reason, COUNT(*) FROM whatsapp_messages WHERE message_status = 'Failed' GROUP BY 1 ORDER BY 2 DESC;` },
  { cat: "WhatsApp", title: "18 · WhatsApp ROI per campaign", desc: "Revenue from Delivered orders whose last click was a WhatsApp button.",
    sql: `SELECT c.campaign_name, c.actual_spend_inr,
       COALESCE(SUM(o.net_revenue_inr), 0) AS revenue,
       ROUND(100 * (COALESCE(SUM(o.net_revenue_inr), 0) - c.actual_spend_inr) / c.actual_spend_inr) AS roi_pct
FROM campaigns c
LEFT JOIN orders o ON o.attributed_campaign_id = c.campaign_id
                  AND o.attributed_channel = 'WhatsApp' AND o.order_status = 'Delivered'
WHERE c.channel = 'WhatsApp'
GROUP BY c.campaign_id, c.campaign_name, c.actual_spend_inr ORDER BY roi_pct DESC;
-- total: spend ${fmtN(W_("spend"))} · revenue ${fmtN(W_("revenue"))} · ROI ${W_("roi")}%` },
  { cat: "Channel", title: "19 · Channel comparison (with the attribution source labelled)", desc: "One table, two measurement systems: say so on the visual.",
    sql: `SELECT c.channel, SUM(c.actual_spend_inr) AS spend,
       CASE WHEN c.channel IN ('Email','WhatsApp')
            THEN (SELECT SUM(o.net_revenue_inr) FROM orders o
                  WHERE o.attributed_channel = c.channel AND o.order_status = 'Delivered')
            ELSE (SELECT SUM(s.purchase_value_inr) FROM social_ads_daily s WHERE s.platform = c.channel) END AS revenue,
       CASE WHEN c.channel IN ('Email','WhatsApp') THEN 'Orders: last click 72h' ELSE 'Meta: platform-reported' END AS source
FROM campaigns c GROUP BY c.channel;
-- ${Object.entries(A.channels || {}).map(([k, v]) => k + " ROAS " + v.roas).join(" · ")}` },
  { cat: "Channel", title: "20 · Gross profit and margin from orders", desc: "Revenue is not profit: subtract product cost.",
    sql: `SELECT product_category,
       ROUND(SUM(net_revenue_inr)) AS revenue,
       ROUND(SUM(net_revenue_inr - product_cost_inr)) AS gross_profit,
       ROUND(100 * SUM(net_revenue_inr - product_cost_inr) / SUM(net_revenue_inr), 1) AS margin_pct
FROM orders WHERE order_status = 'Delivered'
GROUP BY product_category ORDER BY margin_pct DESC;   -- overall ${A.gross_margin_pct}%` },
  { cat: "Data quality", title: "21 · List hygiene checks", desc: M_SQL_BLOCKS[4].desc, sql: M_SQL_BLOCKS[4].sql },
  { cat: "Data quality", title: "22 · Referential integrity across all 9 tables", desc: M_SQL_BLOCKS[1].desc, sql: M_SQL_BLOCKS[1].sql },
  { cat: "Data quality", title: "23 · Cross-table reconciliations", desc: M_SQL_BLOCKS[3].desc, sql: M_SQL_BLOCKS[3].sql },
];

const QA_SQL = M_SQL_BLOCKS.map((b, i) => ({ title: "QA " + (i + 1) + " · " + b.title.replace(/^\d+ · /, ""), desc: b.desc, sql: b.sql }))
  .concat([{ title: "QA 6 · KPI reconciliation query", desc: "One query that returns every P1 email KPI. Paste its output into the reconciliation table below.",
    sql: "SELECT SUM(recipients)                                   AS sent,             -- 177,032\n       ROUND(100 * SUM(delivered) / SUM(recipients), 2)   AS delivery_rate,    -- 98.32\n       ROUND(100 * SUM(unique_opens) / SUM(delivered), 2) AS unique_open_rate, -- 45.42\n       ROUND(100 * SUM(human_unique_opens) / SUM(delivered), 2) AS human_open, -- 31.58\n       ROUND(100 * SUM(unique_clicks) / SUM(delivered), 2) AS unique_ctr,      -- 6.55\n       ROUND(100 * SUM(unique_clicks) / SUM(unique_opens), 2) AS ctor,         -- 14.43\n       ROUND(100 * SUM(unsubscribes) / SUM(delivered), 3) AS unsub_rate        -- 0.267\nFROM vw_email_performance;\n\nSELECT ROUND(100 * (SUM(attributed_revenue) - SUM(actual_spend_inr)) / SUM(actual_spend_inr), 1) AS roi,  -- 106.6\n       ROUND(SUM(attributed_revenue) / SUM(actual_spend_inr), 2) AS roas                                      -- 2.07\nFROM vw_campaign_roi;" }]);

const QA_CHECKLIST = [
  { id: "q1", t: "Row counts match", d: "All 9 tables; Activities 313,895; WhatsApp 73,221; Social 41,736; Web 70,080." },
  { id: "q2", t: "Recipients = Delivered + Bounced", d: `${fmtN(A.sent)} on both sides.` },
  { id: "q3", t: "Unique, not total, opens", d: `${A.unique_open_rate}% unique; ${A.human_open_rate}% human; label which one the card shows.` },
  { id: "q4", t: "Delivery Rate is a %", d: `${A.delivery_rate}%, not ${A.doc_delivery}.` },
  { id: "q5", t: "Web rates are session-weighted", d: `Bounce ${A.bounce_weighted}%, duration ${A.dur_weighted} min.` },
  { id: "q6", t: "Shares use SUM(Sessions) and ALL()", d: "Source and device shares add to 100% and aren't 12.5% / 33.3%." },
  { id: "q7", t: "Revenue = Delivered orders", d: `${inr(A.attr_rev)} attributed; ROI ${A.roi}%.` },
  { id: "q8", t: "Corrections documented", d: "Each KPI-document formula you changed is listed with the reason." },
  { id: "q9", t: "WhatsApp delivered = Delivered + Read", d: `${W_("delivery_rate")}% delivery rate, not ${W_("wrong_delivery_rate")}%.` },
  { id: "q10", t: "Social ratios from sums", d: `CTR ${A.social ? A.social.ctr : ""}%, ER ${A.social ? A.social.er : ""}% computed as SUM ÷ SUM.` },
  { id: "q11", t: "Meta spend = web ad spend", d: "Matches by day except the 2024-03-12 outage." },
  { id: "q12", t: "Attribution source labelled", d: "Channel ROAS cards say 'Orders' or 'Meta platform-reported'." },
];

/* ---------------- EXCEL ---------------- */
const EXCEL_TASKS = [
  ["Delivery Rate", "=SUM(Delivered)/SUM(Recipients)", A.delivery_rate + "%", "Starter ✓"],
  ["Unique Open Rate", "=SUM(Unique_Opens)/SUM(Delivered)", A.unique_open_rate + "%", "Starter ✓"],
  ["Human Open Rate", "=SUM(Human_Unique_Opens)/SUM(Delivered)", A.human_open_rate + "%", "Starter ✓"],
  ["Unique CTR / CTOR", "=SUM(Unique_Clicks)/SUM(Delivered) · /SUM(Unique_Opens)", A.unique_ctr + "% / " + A.ctor + "%", "Starter ✓"],
  ["Email ROI", "=(SUM(Attributed_Revenue_INR)-SUM(Actual_Spend_INR))/SUM(Actual_Spend_INR)", A.roi + "%", "Starter ✓"],
  ["Bounce Rate (web, weighted)", "=SUM(Bounced_Sessions)/SUM(Sessions)", A.bounce_weighted + "%", "Starter ✓"],
  ["Source share", "=SUMIFS(Sessions,Traffic_Source,\"Email\")/SUM(Sessions)", SRCP("Email")[1] + "% (Email)", "Starter ✓"],
  ["Activity breakdown (raw Activities sheet)", "=COUNTIF(Activity_Type,\"Open\")/COUNTA(Activity_Type)", "38.5% Open", "Your task"],
  ["Avg Activity per Email", "=(COUNTA(Activities!A:A)-1)/(COUNTA(Emails!A:A)-1)", String(A.avg_act_per_email), "Your task"],
  ["Campaign lookup on Emails", "=XLOOKUP([@Campaign_ID], Campaigns[Campaign_ID], Campaigns[Campaign_Type])", "8 types", "Your task"],
  ["Send time band", "=IF(HOUR([@Email_Sent_Date])<12,\"Morning\",IF(HOUR([@Email_Sent_Date])<17,\"Afternoon\",\"Evening\"))", "Morning best", "Your task"],
  ["Instagram ROAS (Social_Ads_Daily)", "=SUMIFS(Purchase_Value_INR,Platform,\"Instagram\")/SUMIFS(Spend_INR,Platform,\"Instagram\")", P_("Instagram", "roas") + "", "Your task"],
  ["Social engagement rate", "=(SUM(Likes)+SUM(Comments)+SUM(Shares)+SUM(Saves))/SUM(Impressions)", (A.social ? A.social.er : "") + "%", "Starter ✓"],
  ["WhatsApp delivery rate", "=COUNTIFS(Message_Status,\"<>Failed\")/COUNTA(Message_ID)", W_("delivery_rate") + "%", "Starter ✓"],
  ["WhatsApp read rate", "=COUNTIF(Message_Status,\"Read\")/COUNTIFS(Message_Status,\"<>Failed\")", W_("read_rate") + "%", "Starter ✓"],
  ["Session-weighted duration", "=SUMPRODUCT(Sessions,Avg_Session_Duration_Min)/SUM(Sessions)", f2(A.dur_weighted) + " min", "Starter ✓"],
];
const PIVOTS = [
  { n: "01", h: "Activity breakdown by type", p: "Activities sheet · Rows: Activity_Type · Values: Count of Activity_ID, % of column total." },
  { n: "02", h: "Top campaigns by activities", p: "Add Campaign_Name to Activities via Emails (XLOOKUP twice) · Rows: Campaign_Name · Values: Count · sort descending." },
  { n: "03", h: "Sent vs activity timeline", p: "Emails: Rows = Email_Sent_Date grouped by Month & Year, Values = Sum of Recipients; repeat for Activities, then a combo chart." },
  { n: "04", h: "Traffic source share", p: "Web_Engagement · Rows: Traffic_Source · Values: Sum of Sessions, % of column total (not Count!)." },
  { n: "05", h: "Device × region", p: "Rows: Region · Columns: Device_Type · Values: Sum of Sessions and Sum of Conversions; add a calculated field Conversions/Sessions." },
  { n: "06", h: "Facebook vs Instagram scorecard", p: "Social_Ads_Daily · Rows: Platform · Values: Sum of Spend, Impressions, Link_Clicks, Likes, Comments, Shares, Purchase_Value · add calculated fields CTR, CPC, ROAS." },
  { n: "07", h: "WhatsApp funnel", p: "WhatsApp_Messages · Rows: Message_Status · Values: Count of Message_ID · then Button_Clicked = Yes as a filter for clicks." },
];

/* ---------------- GALLERY ---------------- */
function galleryPages() {
  const m = MD, a = A;
  return [
    { n: "01", t: "Email Campaign Overview", q: "How are our emails performing?", ins: `${fmtN(a.sent)} sent, ${a.delivery_rate}% delivered, ${a.human_open_rate}% human opens, ${a.unique_ctr}% CTR.`, iq: "Why is the human open rate lower than the unique open rate?", aud: "CMO · Email Marketing Manager", keys: ["Delivery Rate", "Open Rate", "CTR", "CTOR"],
      desc: "The Email dashboard's main page: funnel KPI cards, activity breakdown and the send vs activity timeline.",
      mock: { title: "Email Campaign Overview", sub: "2023–2024 · 61 campaigns · 471 sends",
        kpis: [{ v: fmtN(a.sent), l: "Emails sent" }, { v: a.delivery_rate + "%", l: "Delivery rate" }, { v: a.unique_open_rate + "%", l: "Unique open rate" }, { v: a.human_open_rate + "%", l: "Human open rate" }, { v: a.unique_ctr + "%", l: "Unique CTR" }, { v: a.unsub_rate + "%", l: "Unsubscribe rate" }],
        donuts: [{ title: "Activity breakdown by type", data: (m.act_type || []).slice(0, 4) }],
        bars: [{ title: "Emails sent per month (K) — 2024", data: (m.timeline_sent_k || []).slice(12) }, { title: "Top campaigns by activities", data: (m.top_campaigns_acts || []).slice(0, 6) }] },
      build: { tableau: ["Data source: vw_email_performance (one row per email)", "Calcs: SUM([Unique Opens])/SUM([Delivered]) etc.", "Dual-axis sent vs activities by Year_Month"],
               powerbi: ["Measures from the KPI Library; Dim_Date marked as date table", "Is_Machine_Open column for the human open rate", "Card visuals with a definitions tooltip"] } },
    { n: "02", t: "Campaign ROI", q: "Which campaigns pay back?", ins: `Spend ${inr(a.spend)} → ${inr(a.attr_rev)} attributed revenue: ROI ${a.roi}%, ROAS ${a.roas}. ${a.neg_roi_campaigns} campaigns lose money.`, iq: "Why count Delivered orders only?", aud: "CMO · Finance", keys: ["ROI", "ROAS", "Spend", "Revenue"],
      desc: "Drill-through: spend, attributed revenue and ROI by campaign type and campaign.",
      mock: { title: "Campaign ROI", sub: "vw_campaign_roi · last-click, 72 h",
        kpis: [{ v: inrL(a.spend), l: "Actual spend" }, { v: inrL(a.attr_rev), l: "Attributed revenue" }, { v: a.roi + "%", l: "Email ROI" }, { v: String(a.roas), l: "ROAS" }],
        donuts: [{ title: "Attributed revenue by type (₹ L)", data: m.type_rev_l || [] }],
        bars: [{ title: "ROI % by campaign type", data: m.type_roi || [], suffix: "%" }, { title: "Lowest-ROI campaigns", data: m.bottom_campaigns_roi || [], suffix: "%" }] },
      build: { tableau: ["Relate vw_campaign_roi to Campaigns", "Diverging bar coloured by ROI sign", "Tooltip: spend, revenue, orders"], powerbi: ["ROI % = DIVIDE([Attributed Revenue] − [Campaign Spend], [Campaign Spend])", "Conditional formatting red/green", "Drill-through from type to campaign"] } },
    { n: "03", t: "Web Engagement Overview", q: "How is the website performing?", ins: `${mil(a.sessions)} sessions (+${a.sessions_yoy}% YoY), bounce ${a.bounce_weighted}%, ${a.dur_weighted} min per session, CVR ${a.web_cvr}%.`, iq: "Why not AVERAGE the bounce rate column?", aud: "Digital / Growth Manager", keys: ["Sessions", "Bounce Rate", "Session Duration", "CVR"],
      desc: "The Web dashboard's main page: session-weighted KPIs and the monthly trend.",
      mock: { title: "Web Engagement Overview", sub: "Web_Engagement · all visitors",
        kpis: [{ v: mil(a.sessions), l: "Sessions" }, { v: mil(a.uv_sum), l: "Visitor-days (summed UV)" }, { v: a.bounce_weighted + "%", l: "Bounce rate (weighted)" }, { v: f2(a.dur_weighted) + " min", l: "Avg session (weighted)" }, { v: a.web_cvr + "%", l: "Conversion rate" }, { v: "+" + a.sessions_yoy + "%", l: "Sessions YoY" }],
        bars: [{ title: "Sessions per month (K) — 2024", data: (m.web_month_sessions_k || []).slice(12) }, { title: "Bounce rate by source (%)", data: m.src_bounce || [], suffix: "%" }] },
      build: { tableau: ["SUM([Bounced Sessions])/SUM([Sessions])", "Show the 2024-03-12 gap (don't fill with 0)", "Year-over-year table calc"], powerbi: ["Weighted bounce & duration measures (SUMX)", "SAMEPERIODLASTYEAR for YoY", "Line chart on Dim_Date[Year_Month]"] } },
    { n: "04", t: "Channel, Device & Region", q: "Where do visitors come from and what converts?", ins: `Organic ${SRCP("Organic Search")[1]}% of sessions; Email converts best; Mobile ${m.device_pct ? m.device_pct[0][1] : 64}% of sessions but lowest CVR; West leads visitors.`, iq: "Why does a row-count source chart show 12.5% everywhere?", aud: "Digital marketing · Growth", keys: ["Source share", "Device share", "CVR", "Region"],
      desc: "Drill-through: traffic mix, conversion by source and device, region ranking.",
      mock: { title: "Channel, Device & Region", sub: "Shares by SUM(Sessions)",
        kpis: [{ v: SRCP("Organic Search")[1] + "%", l: "Organic share" }, { v: (m.src_cvr ? m.src_cvr.find(x => x[0] === "Email")[1] : 0) + "%", l: "Email CVR (best)" }, { v: (m.device_pct ? m.device_pct[0][1] : 0) + "%", l: "Mobile share" }, { v: (m.roas_paid ? m.roas_paid[0][1] : 0) + "", l: (m.roas_paid ? m.roas_paid[0][0] : "") + " ROAS (web)" }],
        donuts: [{ title: "Device share (sessions)", data: m.device_sessions || [] }],
        bars: [{ title: "Session share by source (%)", data: m.src_sessions_pct || [], suffix: "%" }, { title: "Conversion rate by source (%)", data: m.src_cvr || [], suffix: "%" }, { title: "Unique visitors by region (M)", data: m.region_uv_m || [] }] },
      build: { tableau: ["Percent of total table calc on SUM(Sessions)", "Highlight table source × device", "Map of regions"], powerbi: ["Share measure with ALL(Web_Engagement[Traffic_Source])", "Matrix device × source with CVR", "RANKX for regions"] } },
    { n: "05", t: "Social Media: Facebook vs Instagram", q: "Which platform earns, not just engages?", ins: `FB ROAS ${P_("Facebook", "roas")} vs IG ${P_("Instagram", "roas")}; IG engagement ${P_("Instagram", "er")}% vs FB ${P_("Facebook", "er")}%; ad profit FB ${inrL(P_("Facebook", "profit"))}, IG ${inrL(P_("Instagram", "profit"))}.`, iq: "Why can't you sum Reach across rows?", aud: "Social Media Manager · CMO", keys: ["Ad Spend", "CTR", "Engagement Rate", "ROAS", "Profit %"],
      desc: "Platform cards side by side (like the Power BI sample): spend, sales, profit, engagement, conversion and ROAS, with likes / comments / shares.",
      mock: { title: "Social Media Performance", sub: "Social_Ads_Daily · Meta platform-reported",
        kpis: [{ v: inrL(a.social ? a.social.spend : 0), l: "Ad spend" }, { v: inrL(a.social ? a.social.value : 0), l: "Purchase value" }, { v: inrL(a.social ? a.social.profit : 0), l: "Ad profit (after product cost)" }, { v: (a.social ? a.social.ctr : 0) + "%", l: "Link CTR" }, { v: (a.social ? a.social.er : 0) + "%", l: "Engagement rate" }, { v: String(a.social ? a.social.roas : 0), l: "ROAS" }],
        donuts: [{ title: "Spend by platform (₹ L)", data: m.soc_platform_spend_l || [] }],
        bars: [{ title: "ROAS by platform", data: m.soc_platform_roas || [] }, { title: "Engagement rate by platform (%)", data: m.soc_platform_er || [], suffix: "%" }, { title: "ROAS by campaign type", data: m.soc_type_roas || [] }, { title: "CTR by ad format (%)", data: m.soc_format_ctr || [], suffix: "%" }] },
      build: { tableau: ["Platform as columns of KPI tiles (one sheet per measure)", "Parameter to switch Spend / ROAS / ER", "City and Ad_Format filters"], powerbi: ["Measures as SUM ÷ SUM (CTR, CPC, ER, ROAS)", "Small multiples by Platform", "Slicers: City, Ad_Format, Device, Month — like the sample dashboard"] } },
    { n: "06", t: "WhatsApp Campaigns", q: "Does WhatsApp pay back?", ins: `${fmtN(W_("sent"))} sent · ${W_("delivery_rate")}% delivered · ${W_("read_rate")}% read · ${W_("click_rate")}% clicked · ROI ${W_("roi")}%.`, iq: "Why is Delivered = Delivered + Read?", aud: "CRM Manager · CMO", keys: ["Delivery", "Read", "Click", "Opt-out", "ROI"],
      desc: "Funnel from sent to order, failure reasons and ROI per campaign.",
      mock: { title: "WhatsApp Campaigns", sub: "WhatsApp_Messages + Orders (Attributed_Channel = WhatsApp)",
        kpis: [{ v: fmtN(W_("sent")), l: "Messages sent" }, { v: W_("delivery_rate") + "%", l: "Delivery rate" }, { v: W_("read_rate") + "%", l: "Read rate" }, { v: W_("click_rate") + "%", l: "Click rate" }, { v: W_("optout_rate") + "%", l: "Opt-out rate" }, { v: W_("roi") + "%", l: "ROI" }],
        donuts: [{ title: "Final message status", data: m.wa_status || [] }],
        bars: [{ title: "Funnel", data: m.wa_funnel || [] }, { title: "Click rate by campaign type (%)", data: m.wa_type_click || [], suffix: "%" }, { title: "Failure reasons", data: m.wa_fail || [] }] },
      build: { tableau: ["Calc: [Is Delivered] = [Message Status] <> 'Failed'", "Funnel bars sorted by stage", "ROI from Orders where Attributed_Channel = WhatsApp"], powerbi: ["WA Delivered measure with IN {\"Delivered\",\"Read\"}", "Funnel visual", "Relationship Orders[Attributed_Message_ID] → WhatsApp_Messages (inactive, USERELATIONSHIP)"] } },
    { n: "07", t: "Channel Comparison", q: "Which channel deserves the next rupee?", ins: Object.entries(a.channels || {}).map(([k, v]) => `${k} ROAS ${v.roas}`).join(" · ") + " (Meta numbers platform-reported).", iq: "Can you rank Meta ROAS and Orders ROAS on one chart?", aud: "CMO · Finance", keys: ["Spend", "Revenue", "ROAS", "Source"],
      desc: "Spend, revenue and ROAS for Email, WhatsApp, Facebook and Instagram, each with its measurement source.",
      mock: { title: "Channel Comparison", sub: "Email & WhatsApp: Orders (last click) · FB & IG: Meta Ads Manager",
        kpis: [{ v: inrCr(a.total_campaign_spend || 0), l: "Campaign spend (4 channels)" }, { v: inrCr(a.google_ads_spend || 0), l: "Google Ads spend (web)" }, { v: a.gross_margin_pct + "%", l: "Gross margin (orders)" }, { v: W_("roas") + "×", l: "WhatsApp ROAS" }],
        donuts: [{ title: "Spend by channel (₹ L)", data: m.ch_spend_l || [] }],
        bars: [{ title: "ROAS by channel", data: m.ch_roas || [] }, { title: "Revenue by channel (₹ L)", data: m.ch_revenue_l || [] }] },
      build: { tableau: ["Union of two summaries with a 'Source' column", "Colour bars by Source", "Footnote the attribution rules"], powerbi: ["Channel dimension table (4 rows)", "SWITCH measure picking Orders or Social revenue by channel", "Tooltip with the source"] } },
  ];
}

/* ---------------- ASSIGNMENTS ---------------- */
function assignments() {
  const a = A;
  return [
    { id: "a1", tool: "Data Exploration · Excel or SQL", track: "business", t: "How many rows does the Activities table have?", task: ["Open Activities.", "Count Activity_ID.", "Check against the Dataset page."], type: "num", ans: a.activities, tol: 0, unit: "rows", hint: "Over 300,000.", sol: "SELECT COUNT(*) FROM activities;   -- 313,895" },
    { id: "a2", tool: "SQL · KPI", track: "kpi", t: "What is the Delivery Rate? (two decimals, %)", task: ["Delivered rows ÷ SUM(Recipients) × 100."], type: "num", ans: a.delivery_rate, tol: 0.01, unit: "%", hint: "174,058 ÷ 177,032.", sol: "SELECT ROUND(100 * SUM(activity_type='Delivered') / (SELECT SUM(recipients) FROM emails), 2) FROM activities;   -- 98.32" },
    { id: "a3", tool: "SQL", track: "sql", t: "What does the KPI document's Delivery Rate formula return? (one decimal)", task: ["Delivered activities ÷ COUNT(DISTINCT Email_ID)."], type: "num", ans: a.doc_delivery, tol: 0.1, unit: "", hint: "It's not a percentage.", sol: "174,058 ÷ 471 = 369.5 delivered recipients per email. That's why we changed the formula." },
    { id: "a4", tool: "SQL · KPI", track: "kpi", t: "What is the UNIQUE open rate? (two decimals, %)", task: ["COUNT(DISTINCT email_id, customer_id) of Open rows.", "Divide by Delivered."], type: "num", ans: a.unique_open_rate, tol: 0.01, unit: "%", hint: "79,060 unique openers.", sol: "79,060 ÷ 174,058 = 45.42%. Open rows ÷ Delivered would give 69.48%." },
    { id: "a5", tool: "SQL", track: "sql", t: "What share of Open rows are Apple Mail machine opens? (one decimal, %)", task: ["Join opens to the recipient's Delivered row.", "Flag opens < 15 s after delivery.", "Flagged ÷ all Open rows."], type: "num", ans: a.machine_open_share, tol: 0.1, unit: "%", hint: `${fmtN(a.machine_opens)} machine opens.`, sol: `${fmtN(a.machine_opens)} ÷ ${fmtN(a.opens)} = ${a.machine_open_share}%.` },
    { id: "a6", tool: "Excel", track: "excel", t: "Using Email_Summary in the starter, what is CTOR? (two decimals, %)", task: ["SUM(Unique_Clicks) ÷ SUM(Unique_Opens)."], type: "num", ans: a.ctor, tol: 0.01, unit: "%", hint: "11,407 ÷ 79,060.", sol: "=SUM(Unique_Clicks)/SUM(Unique_Opens) → 14.43%" },
    { id: "a7", tool: "Power BI", track: "powerbi", t: "Write Email ROI %. What does it return? (one decimal)", task: ["Attributed revenue on Delivered orders.", "Minus Actual_Spend_INR, divided by spend."], type: "num", ans: a.roi, tol: 0.1, unit: "%", hint: "₹39,79,280 revenue, ₹19,26,200 spend.", sol: "Email ROI % = DIVIDE([Attributed Revenue] - [Campaign Spend], [Campaign Spend])   -- 106.6%" },
    { id: "a8", tool: "Tableau", track: "tableau", t: "Build ROI by campaign type. Which type has the LOWEST ROI?", task: ["vw_campaign_roi by campaign_type.", "(Revenue − spend) ÷ spend.", "Sort ascending."], type: "select", options: ["Promotional", "Re-engagement", "Newsletter", "Product Launch"], ans: "Re-engagement", hint: "It also has the highest unsubscribe rate.", sol: `Re-engagement: ${Math.round(TT["Re-engagement"] ? TT["Re-engagement"].roi : -49)}% ROI; Promotional is also negative (${Math.round(TT.Promotional ? TT.Promotional.roi : -9)}%).` },
    { id: "a9", tool: "SQL · Web", track: "sql", t: "What is the session-weighted bounce rate? (two decimals, %)", task: ["SUM(bounced_sessions) ÷ SUM(sessions) × 100."], type: "num", ans: a.bounce_weighted, tol: 0.01, unit: "%", hint: "AVERAGE gives 44.29 — that's the wrong one.", sol: "SELECT ROUND(100*SUM(bounced_sessions)/SUM(sessions),2) FROM web_engagement;   -- 49.04" },
    { id: "a10", tool: "Data Model", track: "model", t: "What share of SESSIONS comes from Organic Search? (one decimal, %)", task: ["Sum sessions by source.", "Divide by all sessions."], type: "num", ans: SRCP("Organic Search")[1], tol: 0.1, unit: "%", hint: "Not 12.5%.", sol: "Organic Search 30.6% of sessions. Counting rows gives 12.5% to every source." },
    { id: "a11", tool: "Data Quality", track: "model", t: "How many emails were delivered to customers AFTER they unsubscribed?", task: ["Delivered activities joined to Customers.", "activity_date > unsubscribe_date."], type: "num", ans: a.sends_after_unsub, tol: 0, unit: "emails", hint: "About a hundred.", sol: "104 — the suppression list updates with a lag. A compliance issue to report." },
    { id: "a13", tool: "Social · SQL", track: "sql", t: "What is Instagram's platform-reported ROAS? (two decimals)", task: ["Social_Ads_Daily where Platform = 'Instagram'.", "SUM(Purchase_Value_INR) ÷ SUM(Spend_INR)."], type: "num", ans: P_("Instagram", "roas"), tol: 0.01, unit: "×", hint: "Lower than Facebook.", sol: `Instagram ROAS = ${P_("Instagram", "roas")}; Facebook = ${P_("Facebook", "roas")}.` },
    { id: "a14", tool: "WhatsApp · SQL", track: "kpi", t: "What is the WhatsApp delivery rate? (two decimals, %)", task: ["Delivered = status 'Delivered' OR 'Read'.", "Divide by all messages."], type: "num", ans: W_("delivery_rate"), tol: 0.01, unit: "%", hint: "Not 27.59% — read messages were delivered too.", sol: `${fmtN(W_("delivered"))} ÷ ${fmtN(W_("sent"))} = ${W_("delivery_rate")}%.` },
    { id: "a15", tool: "Power BI", track: "powerbi", t: "Which social platform has the higher ENGAGEMENT rate?", task: ["(Likes+Comments+Shares+Saves) ÷ Impressions by Platform."], type: "select", options: ["Facebook", "Instagram"], ans: "Instagram", hint: "Saves are big on one platform.", sol: `Instagram ${P_("Instagram", "er")}% vs Facebook ${P_("Facebook", "er")}% — but Facebook has the higher ROAS.` },
    { id: "a16", tool: "Tableau", track: "tableau", t: "Which social campaign TYPE has the highest ROAS?", task: ["Join Social_Ads_Daily to Campaigns.", "ROAS by Campaign_Type."], type: "select", options: ["Retargeting", "Acquisition", "Festive", "Awareness"], ans: "Retargeting", hint: "People who already visited.", sol: `Retargeting ${MD.soc_type_roas ? MD.soc_type_roas[0][1] : ""}× — ask how much of it is incremental.` },
    { id: "a12", tool: "Business Analysis", track: "career", t: "Which device has the HIGHEST website conversion rate?", task: ["Conversions ÷ sessions by Device_Type."], type: "select", options: ["Mobile", "Desktop", "Tablet"], ans: "Desktop", hint: "Not the one with the most sessions.", sol: `Desktop ${MD.device_cvr ? MD.device_cvr[0][1] : 2.32}% vs Mobile ${MD.device_cvr ? MD.device_cvr[1][1] : 1.51}% and Tablet ${MD.device_cvr ? MD.device_cvr[2][1] : 1.88}%.` },
  ];
}

/* ---------------- LAB ---------------- */
const LAB = [
  { t: "69% open rate celebration", scn: "The CMO shares a slide: 'Our open rate is 69%!'", opts: [["Agree", "weak"], ["Check whether it counts repeat and machine opens", "best"], ["Say email is dead", "weak"], ["Compare with last year", "ok"]],
    exp: ["Open rows ÷ delivered counts every repeat open.", "Unique openers give 45.4%; without Apple Mail machine opens, 31.6%.", "Show clicks and revenue next to opens: they can't be faked."] },
  { t: "Delivery rate of 369", scn: "A teammate's card reads 'Delivery Rate: 369.5'.", opts: [["Format it as %", "weak"], ["Check the units of numerator and denominator", "best"], ["Hide the card", "weak"], ["Round it", "weak"]],
    exp: ["Delivered recipients ÷ number of emails = recipients per email.", "A rate needs Delivered ÷ Recipients = 98.32%.", "Keep 369.5 only as 'avg delivered per send' if useful."] },
  { t: "Cut Promotional?", scn: "Finance wants to stop all Promotional campaigns because ROI is −9%.", opts: [["Stop them all", "weak"], ["Split by campaign, discount and segment, and test with a holdout", "best"], ["Double the budget", "weak"], ["Ignore finance", "weak"]],
    exp: ["Last-click attribution can under-credit broad campaigns.", "Some Promotional campaigns may be positive; find the losers.", "A holdout shows the true incremental revenue."] },
  { t: "Every source = 12.5%", scn: "Your traffic-source donut has eight equal slices.", opts: [["Ship it", "weak"], ["Change the measure from row count to SUM(Sessions)", "best"], ["Use a bar chart", "weak"], ["Filter to one year", "weak"]],
    exp: ["Each source has one row per day × device × region.", "COUNT of rows is identical for every source.", "Sum Sessions: Organic 30.6%, Google Ads 23.2% … WhatsApp 1.7%."] },
  { t: "Visitors don't match GA", scn: "Google Analytics reports far fewer users than your card's 12.6M 'unique visitors'.", opts: [["Trust your number", "weak"], ["Explain summed UV = visitor-days and reconcile on sessions", "best"], ["Divide by 4", "weak"], ["Delete the card", "ok"]],
    exp: ["GA de-duplicates people across the period.", "Daily UV summed counts a person every day they visit.", "Rename the card or use Sessions as the volume KPI."] },
  { t: "Unsubscribes rising", scn: "Unsubscribe rate went from 0.19% to 0.32% year over year.", opts: [["Ignore, still low", "weak"], ["Check send frequency per subscriber and which campaign types drive it", "best"], ["Remove the unsubscribe link", "weak"], ["Send more Re-engagement", "weak"]],
    exp: ["Volume grew 34% in 2024.", "Re-engagement (0.86%) and Promotional (0.37%) drive unsubscribes.", "Introduce a frequency cap and engagement-based targeting."] },
  { t: "Revenue too high", scn: "Your ROI card says 145%; the reviewer's SQL says 106.6%.", opts: [["Use yours", "weak"], ["Check if returned/cancelled orders are included", "best"], ["Average the two", "weak"], ["Refresh", "ok"]],
    exp: ["All email-attributed orders = ₹47.2 L.", "Delivered only = ₹39.8 L.", "Returns and cancellations aren't revenue."] },
  { t: "Missing day", scn: "Your daily sessions line drops to zero on 12-Mar-2024.", opts: [["Leave it", "weak"], ["Confirm it's a tracking gap, show it as a gap and footnote it", "best"], ["Copy the previous day", "ok"], ["Delete March", "weak"]],
    exp: ["No rows exist for that date.", "A zero suggests the site was down: misleading.", "Show a gap and note the outage; don't silently impute."] },
  { t: "Best campaign?", scn: "The CMO asks: 'Which campaign was the best?'", opts: [["The one with most activities", "weak"], ["Ask 'best by what?' and show CTR, conversion and ROI", "best"], ["The newest one", "weak"], ["Refuse", "weak"]],
    exp: ["Activity volume mostly reflects list size and how long it ran.", "Gold Member Early Access leads CTR; Cart Abandonment leads ROI.", "Agree one metric for future rankings."] },
  { t: "Instagram is our best channel", scn: "The social team shows Instagram has 3× Facebook's engagement and asks for double budget.", opts: [["Approve", "weak"], ["Compare ROAS and ad profit by platform first", "best"], ["Cut Instagram", "weak"], ["Ask for more likes", "weak"]],
    exp: [`Instagram ER ${P_("Instagram", "er")}% vs Facebook ${P_("Facebook", "er")}%.`, `But ROAS ${P_("Instagram", "roas")} vs ${P_("Facebook", "roas")} and Instagram's ad profit is negative after product cost.`, "Fund by profit per rupee; keep Instagram for launches and reach."] },
  { t: "WhatsApp delivery 28%?", scn: "A dashboard card shows WhatsApp delivery rate 27.6%.", opts: [["Escalate to Meta", "weak"], ["Check how 'delivered' is counted from Message_Status", "best"], ["Stop WhatsApp", "weak"], ["Re-send all", "weak"]],
    exp: ["Message_Status stores the last state.", "Read messages were delivered: Delivered = Delivered + Read.", `True delivery rate: ${W_("delivery_rate")}%.`] },
  { t: "Revenue double count", scn: "Finance adds Meta's purchase value to Orders revenue for the board pack.", opts: [["Fine, it's all revenue", "weak"], ["Explain the two attribution sources and keep them separate", "best"], ["Use only Meta", "weak"], ["Average them", "weak"]],
    exp: ["Meta counts click- and view-through purchases with its own window.", "Orders credit Email/WhatsApp last clicks within 72 h.", "They overlap: report each with its source and compare trends."] },
  { t: "Mobile conversion", scn: "Product asks whether to invest in the app or the desktop site.", opts: [["Desktop, it converts best", "ok"], ["Size the gain: mobile is 69% of sessions at 1.51% vs 2.55%", "best"], ["Neither", "weak"], ["Tablet", "weak"]],
    exp: ["Desktop converts better, but mobile has twice the traffic.", "Closing even part of the mobile gap gains more conversions.", "Recommend mobile checkout improvements and measure."] },
];

/* ---------------- INTERVIEW ---------------- */
const QA_CATS = M_QA_CATS;
const QA = M_QA.slice();
const GLOSSARY = M_GLOSSARY;
const TIPS = M_TIPS;
const TIP_CALLOUT = M_TIP_CALLOUT;
const WEAK_STRONG = M_WEAK_STRONG;

/* ---------------- PITCH ---------------- */
const PITCH_FLOW = [
  { t: "Business Problem", d: "Engagement over-reported, spend not linked to revenue.", s: "~10 s", key: ["problem", "spend", "trust", "report"] },
  { t: "Data Sources", d: "103 campaigns across Email, Facebook, Instagram, WhatsApp; 313,895 email events, 73K WhatsApp messages, daily Meta ad results, web traffic.", s: "~10 s", key: ["313,895", "313895", "campaign", "whatsapp"] },
  { t: "Data Cleaning", d: "Repeat & machine opens, unit errors, summed visitors, list hygiene.", s: "~10 s", key: ["clean", "machine", "repeat", "quality"] },
  { t: "Data Model", d: "Star schema around Dim_Date; Campaign_ID and Email_ID keys.", s: "~10 s", key: ["model", "star", "key", "dim_date"] },
  { t: "KPIs", d: "15 KPI-document KPIs corrected + ROI, ROAS, CTOR.", s: "~10 s", key: ["kpi", "open rate", "ctr", "roi"] },
  { t: "Dashboard", d: "Email and Web dashboards in Tableau and Power BI, SQL-reconciled.", s: "~10 s", key: ["dashboard", "tableau", "power bi"] },
  { t: "Insights", d: `Human open ${A.human_open_rate}%, email ROI ${A.roi}%, FB ROAS ${P_("Facebook", "roas")} vs IG ${P_("Instagram", "roas")}, WhatsApp ROI ${W_("roi")}%.`, s: "~15 s", key: ["insight", "31", "roi", "cart"] },
  { t: "Business Impact", d: "Shift budget to triggered flows, frequency cap, fix suppression, mobile checkout.", s: "~15 s", key: ["recommend", "impact", "budget", "suppress"] },
];
const ELEVATOR_PITCH = `AXon Retail's marketing team was reporting a ${Math.round(A.total_open_rate)}% email open rate and had no link between campaign spend and revenue. I built a marketing analytics solution on two years of data: 61 campaigns, 471 email sends, ${fmtN(A.activities)} recipient-level email events, 12,000 subscribers, their orders and ${mil(A.sessions)} website sessions. I loaded it into MySQL, built an email mart view and a campaign ROI view, and created Email Campaign and Web Engagement dashboards in Tableau and Power BI, reconciled to SQL. Along the way I corrected the KPI brief: delivery rate was a count, not a rate, open rate counted repeat and Apple Mail machine opens, and web rates were averaged instead of weighted. The real human open rate is ${A.human_open_rate}%, email ROI is ${A.roi}%, Cart Abandonment and Loyalty campaigns pay back many times over while Re-engagement and Promotional lose money, and mobile brings ${MD.device_pct ? MD.device_pct[0][1] : 64}% of traffic but converts worst. I then added Facebook, Instagram and WhatsApp: Instagram wins on likes but Facebook returns ${P_("Facebook", "roas")}× vs ${P_("Instagram", "roas")}×, and WhatsApp returns ${W_("roi")}% ROI on a small opted-in base. I recommended moving budget to triggered flows, capping send frequency, fixing suppression and improving mobile checkout.`;
const PROJECT_FAQ = M_PROJECT_FAQ;
const RESUME_PROJECT = {
  title: "Email & Web Marketing Analytics — AXon Retail (Capstone)",
  tools: "Tools: SQL (MySQL) | Excel | Tableau | Power BI | DAX",
  bullets: [
    `Analyzed ${fmtN(A.activities)} recipient-level email events across 61 campaigns plus ${mil(A.sessions)} web sessions (2023–2024) from a 7-table dataset`,
    "Built MySQL views (vw_email_performance, vw_campaign_roi) feeding Email Campaign and Web Engagement dashboards in Tableau and Power BI",
    `Corrected brief KPIs: delivery rate unit error, repeat/machine opens (open rate ${A.total_open_rate}% → ${A.human_open_rate}% human), averaged web rates`,
    `Linked spend to last-click revenue: ${A.roi}% email ROI, ROAS ${A.roas}; identified loss-making Re-engagement and Promotional campaigns`,
    "Reconciled all P1 KPIs between SQL, Tableau and Power BI",
    "Flagged post-unsubscribe sends and repeat hard bounces as compliance and deliverability risks",
    `Compared Facebook, Instagram and WhatsApp: FB ROAS ${P_("Facebook", "roas")} vs IG ${P_("Instagram", "roas")}; WhatsApp ROI ${W_("roi")}%; reconciled Meta spend with web ad spend`,
  ],
};
const RESUME_BULLETS = M_RESUME_BULLETS;
const LINKEDIN_POST = `Just wrapped up my Marketing Analytics capstone 📧📈\n\nThe problem: a ${Math.round(A.total_open_rate)}% open rate nobody could trust, and no link between campaign spend and revenue.\n\nWhat I built:\n📊 A 9-table marketing model (Email, Facebook, Instagram, WhatsApp, web) (${fmtN(A.activities)} email events, 61 campaigns, ${mil(A.sessions)} web sessions)\n🧮 Corrected KPIs: unique & human open rate, CTR, CTOR, ROI, session-weighted bounce rate\n📈 Email & Web dashboards in Tableau and Power BI, reconciled with SQL\n\nBiggest insight: once repeat opens and Apple Mail's automatic opens are removed, the real open rate is ${A.human_open_rate}%. And Cart Abandonment emails return ${Math.round(TT["Cart Abandonment"] ? TT["Cart Abandonment"].roi : 1786)}% ROI.\n\nThanks to Mahendra Singh for the guidance!\n\n#DataAnalytics #MarketingAnalytics #EmailMarketing #PowerBI #Tableau #SQL`;
const PORTFOLIO = [
  { n: "01", h: "Publish to Tableau Public", p: "Upload the .twbx with KPI definitions in tooltips, including how open rate is counted." },
  { n: "02", h: "Record a 2-minute walkthrough", p: "Screen-record the dashboard while giving your 90-second pitch." },
  { n: "03", h: "GitHub repo", p: "SQL scripts, the two views, data dictionary, KPI list and screenshots with a clear README." },
  { n: "04", h: "Write a Medium post", p: "\"Your email open rate is lying to you\" or \"Never average a rate column\" make great short write-ups." },
  { n: "05", h: "Add it to LinkedIn Featured", p: "Pin the Tableau Public link and the video." },
  { n: "06", h: "Prepare the deck", p: "The 8 sections: Group Details, Summary, KPI List, Excel, Tableau, Power BI, SQL Query Image, Key Takeaway." },
];
const LEARNING_LINKS = [
  { title: "90-Day AI Learning", desc: "After this project, start your AI journey: a 90-day, week-by-week AI engineer learning plan with a project every week.", url: "https://90daysailearning.vercel.app/", source: "AI Learning" },
  { title: "Data Analyst Roadmap (roadmap.sh)", desc: "A step-by-step visual roadmap of every skill a data analyst needs.", url: "https://roadmap.sh/data-analyst", source: "roadmap.sh" },
  { title: "Mahendra Singh on Medium", desc: "Articles on SQL, Power BI, Tableau and analytics projects.", url: "https://medium.com/@mahendraa1188", source: "Medium" },
].concat(M_LEARNING_LINKS);

/* ---------------- CHAT ---------------- */
const SYNONYMS = { "open": ["open rate", "unique", "human", "machine"], "ctr": ["click", "ctor", "click-through"], "bounce": ["bounced", "hard", "soft"], "roi": ["roas", "revenue", "spend"],
  "visitor": ["unique visitors", "sessions"], "apple": ["machine", "mpp", "privacy"], "source": ["traffic", "channel"], "dax": ["measure", "power bi"], "sql": ["query", "select"], "trap": ["gotcha", "mistake"] };
const INTENT_RULES = [
  { re: /apple|machine|mpp|privacy/i, title: "What is Apple Mail Privacy Protection and why does it matter?" },
  { re: /ctor|click.?to.?open/i, title: "What is CTOR and when is it better than CTR?" },
  { re: /roas|\broi\b/i, title: "What is ROAS and how is it different from ROI?" },
  { re: /369|delivery rate/i, title: "The KPI document's Delivery Rate is not a rate" },
  { re: /unique visitor|sum.*visitor/i, title: "Don't sum Unique_Visitors" },
  { re: /instagram|facebook|meta/i, title: "Facebook vs Instagram: which platform performs better here?" },
  { re: /whatsapp/i, title: "How do you calculate the WhatsApp delivery rate from this table?" },
  { re: /reach|frequency|impression/i, title: "What is the difference between impressions, reach and frequency?" },
];
const CHAT_POPULAR = ["Facebook vs Instagram?", "WhatsApp delivery rate", "What is CTOR?", "Why is open rate 69%?", "ROI vs ROAS", "Apple Mail machine opens", "Give me a scenario question"];
const QUICK_REPLY_POOL = ["What is CTOR?", "Why is open rate 69%?", "ROI vs ROAS", "Apple Mail machine opens", "Why not average bounce rate?", "Delivery rate 369?", "Give me a scenario question"];
/* ============================================================
   References, sample images and 12 common marketing dashboards.
   ============================================================ */
const SRC = {
  star: ["Microsoft Learn: Understand star schema for Power BI", "https://learn.microsoft.com/en-us/power-bi/guidance/star-schema"],
  all: ["Microsoft Learn: ALL function (DAX)", "https://learn.microsoft.com/en-us/dax/all-function-dax"],
  divide: ["Microsoft Learn: DIVIDE function (DAX)", "https://learn.microsoft.com/en-us/dax/divide-function-dax"],
  summarize: ["Microsoft Learn: SUMMARIZE function (DAX)", "https://learn.microsoft.com/en-us/dax/summarize-function-dax"],
};
const QA_REFERENCES = Object.values(SRC);

const SAMPLE_IMAGE_DASHBOARDS = [
  { img: "assets/sample-social-campaign.jpg", t: "Marketing Campaign — Channel Performance", by: "Power BI reference dashboard (illustrative values)",
    does: "A social campaign page: KPI strip with sparklines vs the previous 30 days (Ad Spend, Total Sales, Total Profit, Conversion Rate, Engagement Rate, ROAS), then one card per platform with profit %, ad spend, sales, engagement, conversion, ROAS, likes, shares and comments. Slicers for city, ad type, device and month, plus a second page for monthly traffic.",
    kpis: "Ad spend, sales, profit, profit %, conversion rate, engagement rate, ROAS, likes, shares, comments", visuals: "KPI cards with sparklines, platform cards, slicer bar, page navigator buttons",
    proxima: "Build exactly this on Social_Ads_Daily: Facebook and Instagram cards (Pinterest isn't in AXon's data — use a WhatsApp card from WhatsApp_Messages instead). City, Ad_Format, Device_Type and Dim_Date[Month_Name] are the slicers; profit = Purchase_Gross_Margin_INR − Spend_INR." },
  { img: "assets/dashboard-sample.png", t: "AXon Email Campaign Performance", by: "Built from this project's dataset (real answer-key values)",
    does: "One page with the email funnel KPIs, monthly send volume, ROI by campaign type, activity breakdown, the Apple Mail open inflation and web traffic by source.",
    kpis: "Emails sent, Delivery rate, Unique & Human open rate, Unique CTR, Email ROI", visuals: "KPI cards, monthly bars, diverging ROI bars, donut, grouped bars",
    proxima: "Your Email Campaign Overview should reproduce these numbers exactly." },
];

const VIDI_DASHBOARDS = [
  { name: "Email Campaign Performance", tool: "Power BI / Tableau", tag: "How are our emails doing?", context: "The weekly email team review.",
    what: "Sent, delivered, opened, clicked, unsubscribed, by campaign and over time.", question: "Which sends worked and which hurt the list?", who: "Email marketing manager, CMO",
    kpis: ["Delivery Rate", "Unique / Human Open Rate", "CTR", "CTOR", "Unsubscribe Rate"], visuals: ["Funnel KPI cards", "Sent vs activity timeline", "Top campaigns"], filters: "Date, campaign type, segment",
    build: ["vw_email_performance as the source", "Distinct openers, not Open rows", "Human open rate via Is_Machine_Open"], proxima: `${A.delivery_rate}% delivered, ${A.human_open_rate}% human opens, ${A.unique_ctr}% CTR.`, page: "01 Email Campaign Overview" },
  { name: "Campaign ROI & Budget", tool: "Power BI", tag: "Which campaigns pay back?", context: "Monthly budget review with finance.",
    what: "Budget vs actual spend, attributed revenue, ROI and ROAS by campaign and type.", question: "Where should next quarter's budget go?", who: "CMO, finance",
    kpis: ["Spend", "Attributed Revenue", "ROI %", "ROAS"], visuals: ["Diverging ROI bars", "Spend vs revenue scatter", "Budget utilisation"], filters: "Campaign type, quarter",
    build: ["vw_campaign_roi", "Delivered orders only", "Show attribution rule on the page"], proxima: `ROI ${A.roi}%, ROAS ${A.roas}; ${A.neg_roi_campaigns} campaigns negative.`, page: "02 Campaign ROI" },
  { name: "Web Traffic & Engagement", tool: "Power BI / Tableau", tag: "How is the site doing?", context: "Daily growth stand-up.",
    what: "Sessions, visitors, bounce, duration, pages per session and conversion over time.", question: "Is traffic growing and engaging?", who: "Growth / digital manager",
    kpis: ["Sessions", "Bounce Rate", "Avg Session Duration", "Conversion Rate"], visuals: ["Trend lines", "YoY cards", "Calendar heatmap"], filters: "Date, source, device, region",
    build: ["Session-weighted rates", "Mark the 2024-03-12 gap", "SAMEPERIODLASTYEAR for YoY"], proxima: `${mil(A.sessions)} sessions, +${A.sessions_yoy}% YoY, bounce ${A.bounce_weighted}%.`, page: "03 Web Engagement Overview" },
  { name: "Channel / Traffic Source Mix", tool: "Power BI / Tableau", tag: "Which channels bring buyers?", context: "Channel budget planning.",
    what: "Sessions, bounce, conversion, revenue and ad spend by source.", question: "Which channel deserves the next rupee?", who: "Performance marketing",
    kpis: ["Session share", "CVR by source", "Bounce by source", "Paid ROAS (Google, Facebook, Instagram)"], visuals: ["Share bars", "CVR vs bounce scatter", "ROAS cards"], filters: "Date, device",
    build: ["SUM(Sessions) with ALL() for share", "Ad spend only on paid sources", "Never count rows"], proxima: `Organic ${SRCP("Organic Search")[1]}% of sessions; Email best CVR; Instagram worst.`, page: "04 Channel, Device & Region" },
  { name: "Social Media Ads (Facebook & Instagram)", tool: "Power BI / Tableau", tag: "Which ads earn, not just engage?", context: "Weekly social / performance marketing review.",
    what: "Spend, impressions, reach, CTR, CPC, CPM, engagement, purchases, ROAS and profit by platform, campaign, ad format, city and device.", question: "Where should the next rupee of Meta budget go?", who: "Social media manager, performance marketing, CMO",
    kpis: ["Ad Spend", "CTR", "CPC", "Engagement Rate", "ROAS", "Ad Profit %"], visuals: ["Platform KPI cards with sparklines", "ROAS by campaign type", "Format comparison", "City matrix"], filters: "Month, platform, city, ad format, device",
    build: ["Social_Ads_Daily → Campaigns, Dim_Date", "Ratios as SUM ÷ SUM; never sum Reach", "Profit = margin − spend; label 'platform-reported'"], proxima: `FB ROAS ${P_("Facebook", "roas")}, IG ${P_("Instagram", "roas")}; retargeting ${MD.soc_type_roas ? MD.soc_type_roas[0][1] : ""}×; ${A.soc_campaigns_below_1 || 0} of ${A.soc_campaigns || 28} social campaigns under 1×.`, page: "05 Social Media" },
  { name: "WhatsApp Marketing", tool: "Power BI", tag: "Is WhatsApp worth scaling?", context: "CRM team, after every broadcast.",
    what: "Sent → delivered → read → clicked → ordered funnel, failure reasons, opt-outs, cost and ROI per campaign and template.", question: "Which broadcasts work and are we annoying people?", who: "CRM manager, compliance",
    kpis: ["Delivery Rate", "Read Rate", "Click Rate", "Opt-out Rate", "Cost per delivered", "ROI"], visuals: ["Funnel", "Failure reasons bar", "ROI by campaign", "Opt-out trend"], filters: "Campaign, template, month",
    build: ["Delivered = Delivered + Read", "Orders with Attributed_Channel = WhatsApp", "Opt-in base from Customers"], proxima: `${W_("read_rate")}% read, ${W_("click_rate")}% click, ROI ${W_("roi")}%; ${fmtN(W_("opted_in"))} opted-in customers.`, page: "06 WhatsApp Campaigns" },
  { name: "Device & Experience", tool: "Power BI", tag: "Where does the experience break?", context: "Product and UX teams.",
    what: "Sessions, bounce, duration and conversion by device.", question: "Is mobile losing us sales?", who: "Product, UX",
    kpis: ["Device share", "CVR by device", "Bounce by device"], visuals: ["Device donut", "CVR bars", "Trend by device"], filters: "Source, region",
    build: ["Shares by sessions", "Compare CVR, not volume", "Size the revenue gap"], proxima: `Mobile ${MD.device_pct ? MD.device_pct[0][1] : 64}% of sessions, ${MD.device_cvr ? MD.device_cvr[1][1] : 1.51}% CVR vs ${MD.device_cvr ? MD.device_cvr[0][1] : 2.32}% desktop.`, page: "04 Channel, Device & Region" },
  { name: "Regional Performance", tool: "Tableau", tag: "Which regions to target?", context: "Regional campaigns and logistics.",
    what: "Visitors, sessions, conversions and subscribers by region.", question: "Where to focus regional offers?", who: "Regional marketing",
    kpis: ["Unique visitors by region", "CVR by region", "Subscribers by region"], visuals: ["Filled map", "Ranking bars"], filters: "Date, source",
    build: ["Region from Web_Engagement and Customers", "Only 4 regions: 'Top 5' = all", "Per-capita view if population added"], proxima: `West ${MD.region_uv_m ? MD.region_uv_m[0][1] : 4.3}M visitor-days, East lowest.`, page: "04 Channel, Device & Region" },
  { name: "Subscriber / List Health", tool: "Power BI", tag: "Is our list getting better or worse?", context: "Deliverability and compliance.",
    what: "Opt-ins, unsubscribes, bounces, spam complaints and suppression gaps.", question: "Are we protecting sender reputation?", who: "CRM, compliance",
    kpis: ["Unsubscribe rate", "Hard bounces", "Spam rate", "Sends after unsubscribe"], visuals: ["Trend lines", "Issue cards"], filters: "Month, campaign type",
    build: ["Customers.Unsubscribe_Date vs Delivered", "Repeat hard bounce count", "Alert thresholds"], proxima: `${A.sends_after_unsub} post-unsubscribe sends; ${A.repeat_hard_bounce_customers} repeat hard bounces.`, page: "Data Quality" },
  { name: "A/B Test & Subject Lines", tool: "Power BI / Tableau", tag: "Which subject wins?", context: "Content team.",
    what: "Open, click and CTOR by variant, personalisation and subject length.", question: "What should our subject lines look like?", who: "Content, CRM",
    kpis: ["Human open rate by variant", "CTOR by variant", "Lift %"], visuals: ["Variant comparison bars", "Length vs open scatter"], filters: "Campaign, variant",
    build: ["Emails.AB_Variant (15 A/B tests)", "Use human opens", "Add significance test"], proxima: `Personalised ${MD.open_by_pers ? MD.open_by_pers[1][1] : 35.9}% vs generic ${MD.open_by_pers ? MD.open_by_pers[0][1] : 30.6}% human opens.`, page: "Extension" },
  { name: "Customer Segmentation (RFM)", tool: "Power BI", tag: "Who are our best customers?", context: "CRM and loyalty.",
    what: "Recency, frequency and monetary value from Orders; engagement by loyalty tier.", question: "Whom to reward, whom to win back?", who: "CRM, loyalty",
    kpis: ["Revenue per customer", "Orders per customer", "Days since last order"], visuals: ["RFM grid", "Tier comparison"], filters: "Tier, region",
    build: ["Orders grouped by Customer_ID", "Quintiles for R, F, M", "Join Loyalty_Tier"], proxima: `Platinum ${MD.rev_per_cust_tier ? inr(MD.rev_per_cust_tier[0][1]) : ""} per customer vs Bronze ${MD.rev_per_cust_tier ? inr(MD.rev_per_cust_tier[3][1]) : ""}.`, page: "Extension" },
  { name: "Sales & Orders", tool: "Power BI / Tableau", tag: "What are subscribers buying?", context: "Merchandising.",
    what: "Net revenue, AOV, returns and cancellations by category and month.", question: "Which categories grow, which get returned?", who: "Category managers",
    kpis: ["Net revenue", "AOV", "Return rate", "Revenue YoY"], visuals: ["Category bars", "Monthly trend", "Return heat table"], filters: "Category, status, channel",
    build: ["Delivered orders for revenue", "Return rate on all orders", "Category × month matrix"], proxima: `${inrCr(A.net_rev_delivered)} delivered revenue, AOV ${inr(A.aov)}, Apparel returns 12.2%.`, page: "Extension" },
  { name: "Seasonal / Festive Campaigns", tool: "Tableau", tag: "Did Diwali work?", context: "Festive planning.",
    what: "Traffic, opens and revenue in the festive window vs the rest of the year.", question: "How much lift does the festive season give?", who: "CMO, campaign managers",
    kpis: ["Festive vs normal sessions", "Festive campaign ROI"], visuals: ["Annotated trend", "Before/after bars"], filters: "Year",
    build: ["Dim_Date.Festive_Season flag", "Compare per day, not totals", "Exclude always-on campaigns"], proxima: `Festive days +${f1(A.festive_lift)}% sessions; peak month Oct 2024.`, page: "Extension" },
  { name: "Data Quality Monitor", tool: "Power BI", tag: "Can we trust today's numbers?", context: "Every BI project needs one.",
    what: "Row counts, send reconciliation, orphans, missing days and suppression issues per refresh.", question: "Is the data good enough to report today?", who: "BI team",
    kpis: ["Expected vs actual rows", "Recipients − (Delivered + Bounced)", "Missing dates"], visuals: ["Issue cards", "Trend per check"], filters: "Table",
    build: ["One SQL check per rule (QA page)", "Snapshot counts each refresh", "Alert on change"], proxima: "Recipients 177,032 = Delivered + Bounced; 1 missing web day; Meta spend = web ad spend by day; 0 orphan keys across 9 tables.", page: "QA & Reconciliation" },
];
/* ============================================================
   Helpers
   ============================================================ */
const CHART_COLORS = ["#1677D2", "#F59E0B", "#22C3EE", "#7C3AED", "#16A34A", "#DC2626", "#5B6472", "#0EA5E9"];
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60); }
function copyText(text, btn, label) {
  const done = () => { if (btn) { const o = label || btn.textContent; btn.textContent = "✓ Copied"; setTimeout(() => { btn.textContent = o; }, 1500); } };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  else fallbackCopy(text, done);
}
function fallbackCopy(text, cb) {
  const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
  document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); if (cb) cb();
}

/* ---------------- Storage (never throws) ---------------- */
const STORE_KEY = "axon_mkt_hub_state_v1";
let __memState = null;
function loadState() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) {}
  if (!s) s = __memState;
  s = s || {};
  ["journey", "deliv", "assign", "lab", "qa", "qachk", "recon", "pitch"].forEach(k => { if (!s[k]) s[k] = {}; });
  return s;
}
function saveState(s) { __memState = s; try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (e) {} }
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

/* ---------------- Charts (native SVG / CSS) ---------------- */
function svgDonut(data, size) {
  size = size || 120;
  const total = data.reduce((s, d) => s + Math.abs(d[1]), 0);
  const r = size / 2 - 10, cx = size / 2, cy = size / 2, C = 2 * Math.PI * r;
  let off = 0, circles = "";
  data.forEach((d, i) => {
    const dash = total ? (Math.abs(d[1]) / total) * C : 0;
    circles += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${CHART_COLORS[i % CHART_COLORS.length]}" stroke-width="16" stroke-dasharray="${dash} ${C - dash}" stroke-dashoffset="${-off}" transform="rotate(-90 ${cx} ${cy})"/>`;
    off += dash;
  });
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img">${circles}</svg>`;
}
function renderDonutBlock(chart) {
  const data = chart.data || [];
  const total = data.reduce((s, d) => s + d[1], 0);
  const legend = data.map((d, i) => `<div class="li"><span class="sw" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>${esc(d[0])}: ${Number(d[1]).toLocaleString("en-IN")} (${total ? ((d[1] / total) * 100).toFixed(1) : "0.0"}%)</div>`).join("");
  return `<div class="mock-chart"><div class="ct">${esc(chart.title)}</div><div class="donut-wrap">${svgDonut(data)}<div class="mock-legend">${legend}</div></div></div>`;
}
function renderBarBlock(chart, opts) {
  const data = chart.data || [];
  const max = Math.max(...data.map(d => Math.abs(d[1])), 0);
  const suffix = chart.suffix || "", prefix = chart.prefix || "";
  const base = opts && opts.base;
  const rows = data.map((d, i) => {
    const pct = max ? (Math.abs(d[1]) / max) * 100 : 0;
    const hiC = opts && opts.goodHigh ? "#16A34A" : "#DC2626", loC = opts && opts.goodHigh ? "#DC2626" : "#16A34A";
    const color = base !== undefined ? (d[1] > base * 1.15 ? hiC : d[1] < base * 0.85 ? loC : "#1677D2") : (d[1] < 0 ? "#DC2626" : CHART_COLORS[i % CHART_COLORS.length]);
    const extra = d[2] !== undefined ? ` <span style="color:var(--ink-muted);font-size:10.5px;">n=${d[2]}</span>` : "";
    return `<div class="bar-row"><div class="lab">${esc(d[0])}</div><div class="track"><div class="fill" style="width:${pct}%;background:${color}"></div></div><div class="val">${prefix}${Number(d[1]).toLocaleString("en-IN")}${suffix}${extra}</div></div>`;
  }).join("");
  return `<div class="mock-chart"><div class="ct">${esc(chart.title)}</div>${rows}</div>`;
}
function renderDashMock(d) {
  const kpis = d.kpis.map(k => `<div class="mock-kpi"><div class="v">${k.v}</div><div class="l">${esc(k.l)}</div></div>`).join("");
  const donuts = (d.donuts || []).map(c => renderDonutBlock(c)).join("");
  const bars = (d.bars || []).map(c => renderBarBlock(c)).join("");
  return `<div class="card dash-mock"><div class="mock-head"><h4>${esc(d.title)}</h4><p>${esc(d.sub)}</p></div><div class="mock-kpis">${kpis}</div><div class="mock-charts">${donuts}${bars}</div></div>`;
}

/* ============================================================
   Progress engine
   ============================================================ */
const TRACKS = [
  { id: "business", name: "Business Understanding" }, { id: "model", name: "Data Model & Quality" }, { id: "sql", name: "SQL" },
  { id: "kpi", name: "KPIs" }, { id: "excel", name: "Excel" }, { id: "tableau", name: "Tableau" }, { id: "powerbi", name: "Power BI" },
  { id: "qa", name: "QA" }, { id: "interview", name: "Interview" }, { id: "career", name: "Insights & Career" },
];
function trackScores() {
  const s = loadState();
  const sc = {}; TRACKS.forEach(t => sc[t.id] = [0, 0]);
  JOURNEY.forEach(j => { sc[j.track][1]++; if (s.journey[j.id]) sc[j.track][0]++; });
  DELIVERABLES.forEach(d => { sc[d.track][1]++; if (s.deliv[d.id]) sc[d.track][0]++; });
  assignments().forEach(a => { sc[a.track][1]++; if (s.assign[a.id] && s.assign[a.id].ok) sc[a.track][0]++; });
  const qaDone = QA.filter(q => s.qa[q.cat + "::" + q.q]).length;
  sc.interview[1] += 6; sc.interview[0] += 6 * (QA.length ? qaDone / QA.length : 0);
  sc.interview[1] += 1; if (s.pitch.practiced) sc.interview[0] += 1;
  const labDone = Object.keys(s.lab).length;
  sc.interview[1] += 3; sc.interview[0] += 3 * Math.min(1, labDone / LAB.length);
  const chk = QA_CHECKLIST.filter(c => s.qachk[c.id]).length;
  sc.qa[1] += 3; sc.qa[0] += 3 * (chk / QA_CHECKLIST.length);
  const out = TRACKS.map(t => ({ ...t, pct: sc[t.id][1] ? Math.round((sc[t.id][0] / sc[t.id][1]) * 100) : 0 }));
  const overall = Math.round(out.reduce((a, t) => a + t.pct, 0) / out.length);
  return { tracks: out, overall, qaDone, labDone };
}
function refreshProgress() {
  const { tracks, overall, qaDone } = trackScores();
  const fill = document.getElementById("sidebar-progress-fill"), cap = document.getElementById("sidebar-progress-caption");
  if (fill) fill.style.width = overall + "%";
  if (cap) cap.textContent = `${overall}% project complete · ${qaDone}/${QA.length} interview Qs`;
  const hp = document.getElementById("home-progress");
  if (hp) {
    const top = tracks.slice().sort((a, b) => b.pct - a.pct);
    hp.innerHTML = `<h4>Your Progress</h4><div class="big">${overall}%</div><div class="sub">overall project completion</div>
      <div class="track-list">${tracks.slice(0, 5).map(trackRow).join("")}</div>
      <button class="btn-outline" style="margin-top:14px;padding:8px 14px;" data-goto="progress">See full progress →</button>`;
    hp.querySelector("[data-goto]").addEventListener("click", () => switchView("progress"));
  }
  try { renderCertificate(); } catch (e) {}
  const po = document.getElementById("progress-overall");
  if (po) po.innerHTML = `<h4>Overall Progress</h4><div class="big">${overall}%</div><div class="sub">Average of the ten skill tracks below</div>`;
  const tl = document.getElementById("track-list");
  if (tl) tl.innerHTML = tracks.map(trackRow).join("");
  const todo = document.getElementById("progress-todo");
  if (todo) {
    const s = loadState();
    const openJ = JOURNEY.filter(j => !s.journey[j.id]);
    const openD = DELIVERABLES.filter(d => !s.deliv[d.id]);
    const openA = assignments().filter(a => !(s.assign[a.id] && s.assign[a.id].ok));
    const li = (arr, f) => arr.length ? arr.map(f).join("") : `<div style="padding:4px 0;">✓ All done</div>`;
    todo.innerHTML = `<h5 style="margin:0 0 6px;font-size:13px;color:var(--ink);">Journey steps (${openJ.length} open)</h5>${li(openJ.slice(0, 5), j => `<div style="padding:3px 0;">• <a href="#" data-go="${j.go}">${esc(j.t)}</a></div>`)}
      <h5 style="margin:14px 0 6px;font-size:13px;color:var(--ink);">Deliverables (${openD.length} open)</h5>${li(openD.slice(0, 6), d => `<div style="padding:3px 0;">• ${esc(d.t)}</div>`)}
      <h5 style="margin:14px 0 6px;font-size:13px;color:var(--ink);">Assignments (${openA.length} open)</h5>${li(openA.slice(0, 6), a => `<div style="padding:3px 0;">• ${esc(a.t)}</div>`)}`;
    todo.querySelectorAll("[data-go]").forEach(a => a.addEventListener("click", (e) => { e.preventDefault(); switchView(a.dataset.go); }));
  }
}
function trackRow(t) {
  return `<div class="track-row ${t.pct >= 100 ? "complete" : ""}"><div class="tl">${esc(t.name)}</div><div class="tb"><div class="tf" style="width:${t.pct}%"></div></div><div class="tv">${t.pct}%</div></div>`;
}

/* ============================================================
   Home
   ============================================================ */
function renderStats() {
  const wrap = document.getElementById("stat-strip");
  wrap.innerHTML = STATS.map(s => `<div class="stat"><div class="num">${s.num}</div><div class="lbl">${esc(s.lbl)}</div></div>`).join("");
}
function renderJourney() {
  const wrap = document.getElementById("journey"); const s = loadState();
  wrap.innerHTML = JOURNEY.map((j, i) => `
    ${i ? '<div class="journey-arrow">↓</div>' : ""}
    <div class="journey-step ${s.journey[j.id] ? "done" : ""}">
      <div class="jn">${String(i + 1).padStart(2, "0")}</div>
      <div><h4>${esc(j.t)}</h4><p>${esc(j.d)}</p></div>
      <div class="journey-actions">
        <button class="check-pill ${s.journey[j.id] ? "on" : ""}" data-j="${j.id}">${s.journey[j.id] ? "✓ Done" : "Mark done"}</button>
        <button class="start-btn" data-go="${j.go}">Start →</button>
      </div>
    </div>`).join("");
  wrap.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => switchView(b.dataset.go)));
  wrap.querySelectorAll("[data-j]").forEach(b => b.addEventListener("click", () => {
    const st = loadState(); st.journey[b.dataset.j] = !st.journey[b.dataset.j]; saveState(st); renderJourney(); refreshProgress();
  }));
}
function renderChecklist(containerId, items, bucket) {
  const wrap = document.getElementById(containerId); if (!wrap) return;
  const s = loadState();
  wrap.innerHTML = items.map(d => `
    <div class="deliv-item ${s[bucket][d.id] ? "on" : ""}" data-id="${d.id}" role="checkbox" aria-checked="${!!s[bucket][d.id]}" tabindex="0">
      <div class="box">${s[bucket][d.id] ? "✓" : ""}</div>
      <div><h4>${esc(d.t)}</h4><p>${esc(d.d)}</p>${d.where ? `<div class="where">→ ${esc(d.where)}</div>` : ""}</div>
    </div>`).join("");
  wrap.querySelectorAll(".deliv-item").forEach(it => {
    const toggle = () => { const st = loadState(); st[bucket][it.dataset.id] = !st[bucket][it.dataset.id]; saveState(st); renderChecklist(containerId, items, bucket); refreshProgress(); };
    it.addEventListener("click", toggle);
    it.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } });
  });
}
function renderBeforeAfter() {
  const html = `
    <div class="ba-col ba-before"><h4>❌ Before analytics</h4><ul>${BEFORE_AFTER.before.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="ba-mid">→</div>
    <div class="ba-col ba-after"><h4>✅ After analytics</h4><div class="ba-flow">${BEFORE_AFTER.after.map((x, i) => `${i ? '<div class="dn">↓</div>' : ""}<div class="node">${esc(x)}</div>`).join("")}</div></div>`;
  ["before-after", "before-after-2"].forEach(id => { const w = document.getElementById(id); if (w) w.innerHTML = html; });
}
function renderTools() {
  const wrap = document.getElementById("tool-grid");
  TOOLS.forEach((t, i) => {
    wrap.appendChild(el("div", "card tool-card", `<img class="tool-logo" src="${t.logo}" alt="${t.name} logo"><h4>${t.name}</h4><div class="role">${t.role}</div><p>${t.desc}</p>`));
    if (i < TOOLS.length - 1) wrap.appendChild(el("div", "tool-arrow", "→"));
  });
}
function renderDomainPrimer() {
  document.getElementById("domain-what").textContent = DOMAIN_WHAT;
  document.getElementById("domain-where").innerHTML = DOMAIN_WHERE.map(x => `<div style="padding:5px 0;">• ${esc(x)}</div>`).join("");
  document.getElementById("domain-data").innerHTML = DOMAIN_DATA_TYPES.map(x => `<span>${esc(x)}</span>`).join("");
}
function renderResourceCards(items, containerId) {
  const wrap = document.getElementById(containerId); if (!wrap) return;
  wrap.innerHTML = "";
  items.forEach(d => {
    const action = d.type === "download"
      ? `<a class="doc-download" href="${d.href}" download="${d.filename}" title="Download ${d.name}">⬇</a>`
      : `<a class="doc-download" href="${d.href}" target="_blank" rel="noopener" title="Open ${d.name}">↗</a>`;
    wrap.appendChild(el("div", "card doc-card", `<div class="doc-icon">${d.icon}</div><div class="doc-info"><h4>${esc(d.name)}</h4><p>${esc(d.desc)}</p></div>${action}`));
  });
}
function renderDocuments() {
  renderResourceCards(SOFTWARE_LINKS, "software-grid");
  renderResourceCards(DOCUMENTS, "doc-grid");
  renderResourceCards(DOCUMENTS, "doc-grid-2");
  const ss = document.getElementById("setup-steps");
  if (ss) ss.innerHTML = SETUP_STEPS.map((s, i) => `<div class="card setup-step"><div class="si">${s.i}</div><div class="sn">STEP ${i + 1}</div><h4>${esc(s.t)}</h4><p>${esc(s.d)}</p></div>`).join("");
}
function renderFlow() {
  document.getElementById("flow-grid").innerHTML = FLOW.map((f, i) => `<div class="flow-step"><div class="idx">${String(i + 1).padStart(2, "0")}</div><h4>${esc(f.t)}</h4><p>${esc(f.d)}</p></div>`).join("");
}
function renderTimeline() {
  document.getElementById("timeline").innerHTML = TIMELINE.map(r => `<div class="timeline-row"><div class="d">${r.d}</div><div class="t">${r.t}</div><div>${esc(r.task)}</div></div>`).join("");
}

/* ============================================================
   Business problem
   ============================================================ */
function renderProblem() {
  const pg = document.getElementById("problem-grid");
  pg.innerHTML = PROBLEM_STATEMENT.map(r => `<div class="card rule-card"><div class="head"><div class="icon-badge">${r.icon}</div><h4>${esc(r.h)}</h4></div><p>${esc(r.p)}</p></div>`).join("");
  const list = document.getElementById("bq-list");
  list.innerHTML = bq().map((b, i) => `
    <div class="bq-item ${i === 0 ? "open" : ""}">
      <div class="bq-head"><span class="bqn">Q${i + 1}</span><h4>${esc(b.q)}</h4><span class="chev">⌄</span></div>
      <div class="bq-body"><div class="chain">
        <div class="chain-step"><div class="cl">Question</div><p>${esc(b.q)}</p></div>
        <div class="chain-step"><div class="cl">Data</div><p>${esc(b.data)}</p></div>
        <div class="chain-step"><div class="cl">KPI</div><p>${esc(b.kpi)}</p></div>
        <div class="chain-step"><div class="cl">Analysis</div><p>${esc(b.analysis)}</p></div>
        <div class="chain-step"><div class="cl">Insight</div><p>${esc(b.insight)}</p></div>
        <div class="chain-step rec"><div class="cl">Recommendation</div><p>${esc(b.rec)}</p></div>
      </div></div>
    </div>`).join("");
  list.querySelectorAll(".bq-head").forEach(h => h.addEventListener("click", () => h.parentElement.classList.toggle("open")));
  document.getElementById("req-table").innerHTML = `<thead><tr><th>Req</th><th>Page / Area</th><th>Stakeholder</th><th>What it must answer</th><th>Priority</th></tr></thead>
    <tbody>${REQUIREMENTS.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
}
function renderRules() {
  document.getElementById("rule-grid").innerHTML = RULES.map(r => `<div class="card rule-card ${r.ok ? "ok" : ""}"><div class="head"><div class="icon-badge">${r.icon}</div><h4>${esc(r.h)}</h4></div><p>${esc(r.p)}</p></div>`).join("");
  document.getElementById("focus-grid").innerHTML = FOCUS_AREAS.map(f => `<div class="card tip-card"><h4 style="margin-top:0;">${esc(f.h)}</h4><p>${esc(f.p)}</p></div>`).join("");
}

/* ============================================================
   Data pages
   ============================================================ */
function renderDataset() {
  document.getElementById("coverage-text").textContent = COVERAGE_TEXT;
  const rows = {}; Object.keys(TABLE_SRC).forEach(t => rows[t] = (MKT.rows || {})[TABLE_SRC[t]]);
  document.getElementById("ds-grid").innerHTML = Object.keys(TABLE_TYPES).map(t => {
    const ty = TABLE_TYPES[t]; const cls = ty === "Dimension" ? "dim" : "fact";
    const pu = TABLE_PURPOSE[t] || ["", ""];
    return `<div class="card ds-card ${cls}"><div class="k">${esc(ty)}</div><h4>${t}</h4><div class="rows">${Number(rows[t] || 0).toLocaleString("en-IN")} rows</div>
      <dl class="ds-meta"><dt>Grain</dt><dd>${esc(TABLE_GRAIN[t])}</dd><dt>PK</dt><dd><code>${TABLE_PK[t]}</code></dd><dt>FK</dt><dd>${esc(TABLE_FK[t] || "—")}</dd><dt>Date</dt><dd>${esc(TABLE_DATE[t] || "—")}</dd><dt>Purpose</dt><dd>${esc(pu[0])}</dd></dl>
      <details class="ds-why"><summary>Why does this table exist?</summary><p>${esc(pu[1])}</p></details></div>`;
  }).join("");
  document.getElementById("story-table").innerHTML = `<thead><tr><th>When</th><th>Event</th><th>What happened</th><th>Where you'll see it</th></tr></thead>
    <tbody>${STORY.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
}
function renderModel() {
  const rows = {}; Object.keys(TABLE_SRC).forEach(t => rows[t] = (MKT.rows || {})[TABLE_SRC[t]]);
  document.getElementById("schema-grid").innerHTML = Object.keys(TABLE_TYPES).map(t => {
    const ty = TABLE_TYPES[t]; const isFact = ty.startsWith("Fact");
    return `<div class="table-node ${isFact ? "fact" : ""} ${t === "Activities" ? "center" : ""}"><div class="hd"><span>${t}</span><span>${Number(rows[t] || 0).toLocaleString("en-IN")}</span></div>
      <div class="bd"><div><span class="pk">${TABLE_PK[t]}</span> · PK</div><div>FK: ${TABLE_FK[t] || "—"}</div><div style="margin-top:4px;opacity:.85;">${ty}</div></div></div>`;
  }).join("");
  const rel = document.getElementById("rel-list");
  rel.innerHTML = `<h4 style="font-size:15px;margin-bottom:6px;">Relationships</h4>` + RELATIONSHIPS.map(r => `<div class="r"><span class="card-arrow">↳</span><span>${esc(r)}</span></div>`).join("");
  document.getElementById("load-order").innerHTML = LOAD_ORDER.map(x => `<div style="padding:5px 0;">${esc(x)}</div>`).join("");
  document.getElementById("calc-fields").innerHTML = CALC_FIELDS.map(x => `<div style="padding:5px 0;">• ${esc(x)}</div>`).join("");
  document.getElementById("gotchas-list").innerHTML = GOTCHAS.map(g => `<div class="gotcha-card"><div class="gotcha-title">⚠️ ${esc(g.t)}</div><div class="gotcha-desc">${esc(g.d)}</div></div>`).join("");
  document.getElementById("global-filters").innerHTML = GLOBAL_FILTERS.map(([n, src]) =>
    `<div style="display:flex;justify-content:space-between;gap:16px;padding:7px 0;border-top:1px solid var(--line-soft);"><span style="font-weight:600;color:var(--ink);">${esc(n)}</span><span style="font-family:var(--mono);font-size:12px;">${esc(src)}</span></div>`).join("");
  document.getElementById("join-guide-table").innerHTML = `<thead><tr><th>Type</th><th>Table</th><th>Primary Key</th><th>Foreign Keys</th><th>Grain</th><th>Rows</th></tr></thead>
    <tbody>${Object.keys(TABLE_TYPES).map(t => `<tr><td>${esc(TABLE_TYPES[t])}</td><td><code>${t}</code></td><td>${TABLE_PK[t]}</td><td>${TABLE_FK[t] || "—"}</td><td>${esc(TABLE_GRAIN[t])}</td><td class="num">${Number(rows[t] || 0).toLocaleString("en-IN")}</td></tr>`).join("")}</tbody>`;
  document.getElementById("dash-table").innerHTML = `<thead><tr><th>#</th><th>Page</th><th>Audience</th><th>Primary KPIs</th><th>Key visuals</th></tr></thead>
    <tbody>${DASHBOARDS.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
  const jp = document.getElementById("join-paths-table");
  if (jp) jp.innerHTML = `<thead><tr><th>Analysis</th><th>Join condition</th></tr></thead><tbody>${M_JOIN_PATHS.map(([a, b]) => `<tr><td>${esc(a)}</td><td><code>${esc(b)}</code></td></tr>`).join("")}</tbody>`;
  const img = document.getElementById("model-img");
  if (img) img.addEventListener("click", () => openModal(`<img class="zoom-img" src="${img.src}" alt="${esc(img.alt)}">`));
}
let ddKind = "All";
function renderDataDictionary(filterText) {
  const wrap = document.getElementById("datadict-tables"); if (!wrap) return;
  const q = (filterText !== undefined ? filterText : (document.getElementById("dd-search") || {}).value || "").trim().toLowerCase();
  const pills = document.getElementById("dd-pills");
  if (pills && !pills.children.length) {
    ["All", "Fact", "Dimension"].forEach(k => {
      const b = el("button", "pill" + (k === ddKind ? " active" : ""), k);
      b.dataset.k = k;
      b.addEventListener("click", () => { ddKind = k; pills.querySelectorAll(".pill").forEach(p => p.classList.toggle("active", p.dataset.k === k)); renderDataDictionary(); });
      pills.appendChild(b);
    });
  }
  wrap.innerHTML = "";
  M_DATA_DICTIONARY.forEach(t => {
    const kind = (TABLE_TYPES[t.table] || "Dimension").startsWith("Fact") ? "Fact" : "Dimension";
    if (ddKind !== "All" && kind !== ddKind) return;
    const rows = t.cols.filter(c => !q || (t.table + " " + c.join(" ")).toLowerCase().includes(q));
    if (!rows.length) return;
    const card = el("div", "card dd-table-card table-scroll");
    card.innerHTML = `<div class="hd"><h4>${t.table}</h4><span class="tag p2">${esc(t.rows)}</span></div>
      <table class="dtable"><thead><tr><th>Column</th><th>Type</th><th>Description</th><th>Example / blanks</th></tr></thead>
      <tbody>${rows.map(([c, ty, d, n]) => `<tr><td><code>${esc(c)}</code></td><td><span class="col-type">${ty}</span></td><td>${esc(d)}</td><td>${esc(n)}</td></tr>`).join("")}</tbody></table>`;
    wrap.appendChild(card);
  });
  if (!wrap.children.length) wrap.appendChild(el("div", "empty-state", "No columns match that search."));
}
function renderQuality() {
  document.getElementById("null-notes").innerHTML = NULL_NOTES.map(x => `<div style="padding:6px 0;border-top:1px solid var(--line-soft);">• ${esc(x)}</div>`).join("");
  document.getElementById("dq-table").innerHTML = `<thead><tr><th>Check</th><th>Rule</th><th>Tables</th><th>Severity</th></tr></thead>
    <tbody>${DQ_RULES.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
}

/* ============================================================
   KPI Library
   ============================================================ */
let kpiActiveCat = "All", kpiSearch = "", kpiStarredOnly = false, kpiTier = "All";
function renderKpiTiers() {
  ["P1", "P2", "P3"].forEach(p => { const e = document.getElementById("kr-" + p.toLowerCase()); if (e) e.textContent = KPIS.filter(k => k.prio === p).length + " KPIs"; });
  const w = document.getElementById("kpi-tier-pills"); if (!w) return; w.innerHTML = "";
  [["All", "All tiers"], ["P1", "P1 · Must know"], ["P2", "P2 · Important"], ["P3", "P3 · Advanced"]].forEach(([v, l]) => {
    const b = el("button", "pill" + (v === kpiTier ? " active" : ""), l); b.addEventListener("click", () => { kpiTier = v; renderKpiTiers(); renderKpiGrid(); }); w.appendChild(b);
  });
}
function renderKpiPills() {
  const wrap = document.getElementById("kpi-pills"); wrap.innerHTML = "";
  KPI_CATS.forEach(c => {
    const n = c === "All" ? KPIS.length : KPIS.filter(k => k.cat === c).length;
    const b = el("button", "pill" + (c === kpiActiveCat ? " active" : ""), `${c} (${n})`);
    b.addEventListener("click", () => { kpiActiveCat = c; renderKpiPills(); renderKpiGrid(); });
    wrap.appendChild(b);
  });
}
function renderKpiGrid() {
  const wrap = document.getElementById("kpi-grid"); wrap.innerHTML = "";
  const q = kpiSearch.trim().toLowerCase(); const bm = getBookmarks();
  const list = KPIS.filter(k => (kpiTier === "All" || k.prio === kpiTier) && (kpiActiveCat === "All" || k.cat === kpiActiveCat) && (!q || (k.name + k.q + k.desc + k.formula + k.table + k.dax).toLowerCase().includes(q)) && (!kpiStarredOnly || bm.kpi[k.name]));
  if (!list.length) { wrap.appendChild(el("div", "empty-state", kpiStarredOnly ? "No starred KPIs yet. Tap the ★ on any card to save it here." : "No KPIs match that search.")); return; }
  list.forEach(k => {
    const starred = !!bm.kpi[k.name];
    const c = el("div", "card kpi-card"); c.id = "kpi-" + slugify(k.name);
    c.innerHTML = `
      <div class="top"><h4>${esc(k.name)}</h4>
        <div class="card-top-actions"><span class="tag ${k.prio === "P1" ? "p1" : "p2"} tier-${k.prio}">${k.prio}</span>
          <button class="link-btn" title="Copy link to this KPI" data-link-kpi="${esc(k.name)}">🔗</button>
          <button class="star-btn ${starred ? "starred" : ""}" title="Star this KPI" data-star-kpi="${esc(k.name)}">${starred ? "★" : "☆"}</button></div></div>
      <p class="kpi-q">${esc(k.q)}</p>
      <p class="kpi-logic">${esc(k.desc)}</p>
      <div class="kpi-plain">${esc(k.plain)}</div>
      <div class="formula">${esc(k.formula)}</div>
      ${k.dax ? `<div class="formula dax">${esc(k.dax)}</div>` : ""}
      <div class="kpi-ans"><span>Answer key: ${esc(k.v25)}</span>${k.wrong ? `<span class="bm">⚠ Wrong: ${esc(k.wrong)}</span>` : ""}</div>
      <div class="meta"><span>${esc(k.table)}</span><span>${esc(k.cat)} · ${esc(k.dir)}</span></div>`;
    wrap.appendChild(c);
  });
  wrap.querySelectorAll("[data-star-kpi]").forEach(b => b.addEventListener("click", () => { toggleBookmark("kpi", b.dataset.starKpi); renderKpiGrid(); }));
  wrap.querySelectorAll("[data-link-kpi]").forEach(b => b.addEventListener("click", () => copyDeepLink("kpi", b.dataset.linkKpi)));
}

/* ============================================================
   SQL, Excel, Analysis
   ============================================================ */
let sqlCat = "All", sqlPractice = false;
function sqlHint(sql) {
  const kw = (sql.match(/\b(SELECT|JOIN|LEFT JOIN|WHERE|GROUP BY|HAVING|ORDER BY|WITH|CASE|SUM|COUNT|AVG|DATEDIFF|ROW_NUMBER|RANK|COALESCE|COUNT_IF|IFF|TRY_TO_NUMBER|TO_DATE|COPY INTO|CREATE TABLE|CREATE OR REPLACE VIEW|UNION ALL)\b/gi) || []).map(x => x.toUpperCase());
  const tables = sql.match(/\b(fact_\w+|dim_\w+|vw_\w+)\b/g) || [];
  return `Tables: ${[...new Set(tables)].join(", ") || "—"} · Key SQL: ${[...new Set(kw)].slice(0, 8).join(", ")}`;
}
function sqlBlockHtml(b, idx, prefix) {
  const exp = (b.sql.match(/--\s*[^\n]*\d[^\n]*/g) || []).slice(0, 3).map(x => x.replace(/^--\s*/, "")).join(" · ");
  if (prefix === "s" && sqlPractice) {
    return `<div class="card sql-block practice"><div class="hd"><div><h4>${esc(b.title)}</h4><p><strong>Your task:</strong> ${esc(b.desc)}</p></div></div>
      ${exp ? `<div class="sql-expect">🎯 Expected result: ${esc(exp)}</div>` : ""}
      <div class="sql-steps"><button class="btn-outline" data-hint="${idx}">💡 Show hint</button><button class="btn-blue" data-reveal="${idx}">🔓 Reveal solution</button></div>
      <div class="hint-text" id="sqlh-${idx}" style="display:none;">${esc(sqlHint(b.sql))}</div>
      <pre id="sqls-${idx}" style="display:none;">${esc(b.sql)}</pre></div>`;
  }
  const lv = b.level || ({ Setup: "Easy", KPI: "Easy", Web: "Medium", Breakdown: "Medium", Social: "Medium", WhatsApp: "Medium" }[b.cat] || "Advanced");
  return `<div class="card sql-block"><div class="hd"><div><h4><span class="lvl lvl-${lv.toLowerCase()}">${lv}</span> ${esc(b.title)}</h4><p>${esc(b.desc)}</p></div><button class="copy-btn" data-copy="${prefix}${idx}">Copy</button></div><pre>${esc(b.sql)}</pre></div>`;
}
function renderSql() {
  const pills = document.getElementById("sql-pills");
  const cats = ["All", ...new Set(SQL_BLOCKS.map(b => b.cat))];
  pills.innerHTML = "";
  cats.forEach(c => { const b = el("button", "pill" + (c === sqlCat ? " active" : ""), c); b.addEventListener("click", () => { sqlCat = c; renderSql(); }); pills.appendChild(b); });
  const wrap = document.getElementById("sql-list");
  wrap.innerHTML = SQL_BLOCKS.map((b, i) => (sqlCat === "All" || b.cat === sqlCat) ? sqlBlockHtml(b, i, "s") : "").join("");
  wrap.querySelectorAll("[data-copy]").forEach(btn => btn.addEventListener("click", () => copyText(SQL_BLOCKS[+btn.dataset.copy.slice(1)].sql, btn, "Copy")));
  wrap.querySelectorAll("[data-hint]").forEach(b => b.addEventListener("click", () => { const x = document.getElementById("sqlh-" + b.dataset.hint); x.style.display = x.style.display === "none" ? "block" : "none"; }));
  wrap.querySelectorAll("[data-reveal]").forEach(b => b.addEventListener("click", () => { document.getElementById("sqls-" + b.dataset.reveal).style.display = "block"; b.remove(); }));
  const t = document.getElementById("sql-practice-toggle");
  if (t && !t._bound) { t._bound = true; t.addEventListener("click", () => { sqlPractice = !sqlPractice; t.textContent = sqlPractice ? "Turn practice mode OFF" : "Turn practice mode ON"; renderSql(); }); }
}
function renderExcel() {
  document.getElementById("excel-table").innerHTML = `<thead><tr><th>Calculation</th><th>Excel formula pattern</th><th>Expected result</th><th>Status</th></tr></thead>
    <tbody>${EXCEL_TASKS.map(r => `<tr><td>${esc(r[0])}</td><td><code>${esc(r[1])}</code></td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join("")}</tbody>`;
  document.getElementById("pivot-grid").innerHTML = PIVOTS.map(t => `<div class="card tip-card"><div class="n">${t.n}</div><h4>${esc(t.h)}</h4><p>${esc(t.p)}</p></div>`).join("");
}
function renderAnalysis() {
  document.getElementById("vol-base").textContent = A.human_open_rate + "% human open rate · " + A.roi + "% email ROI";
  const card = (t, sub, data, suffix, opts) => `<div class="card chart-card"><h4>${esc(t)}</h4><div class="cs">${esc(sub)}</div>${renderBarBlock({ title: "", data: data || [], suffix: suffix || "" }, opts)}</div>`;
  const tc = (MD.open_by_client || []).map(x => [x[0] + " (raw)", x[1]]).concat((MD.human_open_by_client || []).filter(x => x[0] === "Apple Mail").map(x => [x[0] + " (human)", x[1]]));
  document.getElementById("driver-grid").innerHTML =
      card("Open rate by email client (%)", "Apple Mail's machine opens inflate the raw number", tc, "%")
    + card("ROI % by campaign type", `Overall ${A.roi}%; ${A.neg_roi_campaigns} campaigns below zero`, MD.type_roi, "%")
    + card("Unique CTR % by campaign type", "Triggered and loyalty emails get clicked", MD.type_ctr, "%")
    + card("Unsubscribe rate % by campaign type", "Re-engagement burns the list", MD.type_unsub, "%")
    + card("Human open rate by send time (%)", "Morning sends open best", MD.open_by_time, "%")
    + card("Session share by traffic source (%)", "Counting rows would show 12.5% each", MD.src_sessions_pct, "%")
    + card("Conversion rate by source (%)", "Email converts best, Social worst", MD.src_cvr, "%")
    + card("Conversion rate by device (%)", `Mobile = ${MD.device_pct ? MD.device_pct[0][1] : 64}% of sessions, lowest CVR`, MD.device_cvr, "%")
    + card("Social ROAS by platform", "Facebook earns more per rupee", MD.soc_platform_roas)
    + card("Social engagement rate by platform (%)", "Instagram wins likes and saves", MD.soc_platform_er, "%")
    + card("Social ad profit after product cost (₹ L)", "Instagram loses money", MD.soc_platform_profit_l)
    + card("Social ROAS by campaign type", "Retargeting ≫ awareness", MD.soc_type_roas)
    + card("WhatsApp funnel", `${A.wa ? A.wa.read_rate : ""}% read · ${A.wa ? A.wa.click_rate : ""}% click`, MD.wa_funnel)
    + card("ROAS by channel", "Email/WhatsApp from Orders · FB/IG from Meta", MD.ch_roas);
  document.getElementById("insights-grid").innerHTML = bq().map((k, i) => `
    <div class="card insight-card tint-${i % 6}"><div class="insight-label">Insight</div><p class="insight-text">${esc(k.insight)}</p>
    <div class="insight-label rec">Recommendation</div><p class="insight-text">${esc(k.rec)}</p></div>`).join("");
}

/* ============================================================
   Dashboard gallery + modal
   ============================================================ */
function openModal(html) {
  document.getElementById("modal-body").innerHTML = html;
  document.getElementById("modal-overlay").classList.add("open");
}
function closeModal() { document.getElementById("modal-overlay").classList.remove("open"); }
function initModal() {
  const ov = document.getElementById("modal-overlay");
  document.getElementById("modal-close").addEventListener("click", closeModal);
  ov.addEventListener("click", (e) => { if (e.target === ov) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}
function renderGallery() {
  const pages = galleryPages();
  document.getElementById("gallery-grid").innerHTML = pages.map((p, i) => `
    <div class="card gallery-card">
      <div class="gtop"><div class="gnum">${p.n}</div><h4>${esc(p.t)}</h4><div class="gk">${p.keys.map(k => `<span>${esc(k)}</span>`).join("")}</div></div>
      <div class="gbody"><div class="gq">❓ ${esc(p.q)}</div><p>${esc(p.desc)}</p><div class="gins">💡 ${esc(p.ins)}</div><div class="gaud">Audience: ${esc(p.aud)}</div><button class="btn-blue" data-dash="${i}">View Dashboard →</button></div>
    </div>`).join("");
  document.querySelectorAll("[data-dash]").forEach(b => b.addEventListener("click", () => {
    const p = pages[+b.dataset.dash];
    openModal(`<div class="flow-strip"><div><span>Business question</span>${esc(p.q)}</div><div><span>KPIs</span>${esc(p.keys.join(" · "))}</div><div><span>Key insight</span>${esc(p.ins)}</div><div><span>Interview question</span>${esc(p.iq)}</div></div>` + renderDashMock(p.mock) + `<div class="build-notes">
      <div class="card"><h5>📈 Build it in Tableau</h5><ul>${p.build.tableau.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="card"><h5>⚡ Build it in Power BI</h5><ul>${p.build.powerbi.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div>`);
  }));
}

/* ============================================================
   QA page
   ============================================================ */
const RECON_KPIS = ["Emails Sent", "Delivered", "Delivery Rate", "Bounce Rate", "Open Rate (Unique)", "Human Open Rate", "Click-Through Rate (Unique CTR)", "Click-to-Open Rate (CTOR)", "Unsubscribe Rate", "Avg Activity per Email", "Campaign Spend", "Attributed Revenue", "Email ROI %", "ROAS", "Sessions", "Avg Bounce Rate", "Avg Session Duration", "Website Conversion Rate", "Ad Spend (Facebook + Instagram)", "Link CTR", "Engagement Rate (Social)", "Social ROAS (platform-reported)", "WhatsApp Delivery Rate", "WhatsApp Read Rate", "WhatsApp ROI %"];
function renderQA() {
  const wrap = document.getElementById("qa-sql-list");
  wrap.innerHTML = QA_SQL.map((b, i) => sqlBlockHtml(b, i, "q")).join("");
  wrap.querySelectorAll("[data-copy]").forEach(btn => btn.addEventListener("click", () => copyText(QA_SQL[+btn.dataset.copy.slice(1)].sql, btn, "Copy")));
  const s = loadState();
  const rows = RECON_KPIS.map(n => KPIS.find(k => k.name === n)).filter(Boolean);
  const t = document.getElementById("recon-table");
  t.innerHTML = `<thead><tr><th>KPI (answer key)</th><th>SQL / answer key</th><th>Your Tableau value</th><th>Your Power BI value</th><th>Status</th></tr></thead>
    <tbody>${rows.map(k => {
      const r = s.recon[k.id] || {};
      return `<tr data-id="${k.id}" data-ans="${esc(k.v25)}"><td>${esc(k.name)}</td><td class="num">${esc(k.v25)}</td>
        <td><input class="search-input" style="max-width:130px;padding:6px 10px;" data-f="tab" value="${esc(r.tab || "")}"></td>
        <td><input class="search-input" style="max-width:130px;padding:6px 10px;" data-f="pbi" value="${esc(r.pbi || "")}"></td>
        <td class="st"></td></tr>`;
    }).join("")}</tbody>`;
  const evalRow = (tr) => {
    const ansM = String(tr.dataset.ans).replace(/,/g, "").match(/-?\d+(\.\d+)?/); const ans = ansM ? parseFloat(ansM[0]) : NaN;
    const vals = [...tr.querySelectorAll("input")].map(i => i.value.trim());
    const ok = vals.map(v => v !== "" && Math.abs(parseFloat(v.replace(/[^0-9.\-]/g, "")) - ans) <= Math.max(0.011, Math.abs(ans) * 0.001));
    const st = tr.querySelector(".st");
    if (vals.every(v => v === "")) st.textContent = "";
    else if (ok.every(Boolean)) st.innerHTML = `<span class="recon-ok">✓ Ties out</span>`;
    else st.innerHTML = `<span style="color:var(--red);font-weight:700;">✗ Investigate</span>`;
  };
  t.querySelectorAll("tbody tr").forEach(tr => {
    evalRow(tr);
    tr.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => {
      const st = loadState(); st.recon[tr.dataset.id] = st.recon[tr.dataset.id] || {}; st.recon[tr.dataset.id][inp.dataset.f] = inp.value; saveState(st); evalRow(tr);
    }));
  });
  renderChecklist("qa-checklist", QA_CHECKLIST, "qachk");
}

/* ============================================================
   Assignments
   ============================================================ */
function renderAssignments() {
  const list = assignments(); const s = loadState();
  const done = list.filter(a => s.assign[a.id] && s.assign[a.id].ok).length;
  document.getElementById("assign-score").textContent = `${done} / ${list.length} assignments solved`;
  const wrap = document.getElementById("assign-list");
  wrap.innerHTML = list.map((a, i) => {
    const st = s.assign[a.id] || {};
    const input = a.type === "select"
      ? `<select data-in="${a.id}"><option value="">Choose…</option>${a.options.map(o => `<option ${st.last === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`
      : `<input type="text" inputmode="decimal" data-in="${a.id}" placeholder="Your answer${a.unit ? " (" + a.unit + ")" : ""}" value="${esc(st.last || "")}">`;
    return `<div class="card assign-card" id="as-${a.id}">
      <div class="assign-head"><span class="an">Assignment ${String(i + 1).padStart(2, "0")}</span><div><h4>${esc(a.t)}</h4><div class="tool">${esc(a.tool)}</div></div>
        <span class="status ${st.ok ? "ok" : ""}">${st.ok ? "✓ Solved" : st.tries ? `${st.tries} attempt${st.tries > 1 ? "s" : ""}` : "Not started"}</span></div>
      <div class="assign-steps"><button data-tab="task" class="active">1 · View Task</button><button data-tab="check">2 · Check Answer</button><button data-tab="sol">3 · Solution</button></div>
      <div class="assign-panel show" data-p="task"><strong>What to do</strong><ul>${a.task.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
      <div class="assign-panel" data-p="check"><div class="answer-row">${input}<button class="btn-blue" data-check="${a.id}">Check</button><button class="btn-outline" data-hint="${a.id}">Hint</button></div>
        <div class="answer-feedback ${st.ok ? "good" : ""}">${st.ok ? "✓ Correct, and it matches the dataset." : ""}</div><div class="hint-text" style="display:none;">💡 ${esc(a.hint)}</div></div>
      <div class="assign-panel" data-p="sol">${st.tries ? `<pre>${esc(a.sol)}</pre>` : `<div class="hint-text">🔒 Make at least one attempt in <strong>Check Answer</strong> to unlock the solution.</div>`}</div>
    </div>`;
  }).join("");
  wrap.querySelectorAll(".assign-card").forEach(card => {
    card.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => {
      card.querySelectorAll("[data-tab]").forEach(x => x.classList.toggle("active", x === b));
      card.querySelectorAll("[data-p]").forEach(p => p.classList.toggle("show", p.dataset.p === b.dataset.tab));
    }));
  });
  wrap.querySelectorAll("[data-hint]").forEach(b => b.addEventListener("click", () => { const h = b.closest(".assign-panel").querySelector(".hint-text"); h.style.display = h.style.display === "none" ? "block" : "none"; }));
  wrap.querySelectorAll("[data-check]").forEach(b => b.addEventListener("click", () => {
    const a = list.find(x => x.id === b.dataset.check);
    const inp = wrap.querySelector(`[data-in="${a.id}"]`); const raw = inp.value.trim();
    if (!raw) return;
    let ok;
    if (a.type === "select") ok = raw === a.ans;
    else { const v = parseFloat(raw.replace(/[₹,%\s]/g, "")); ok = !isNaN(v) && Math.abs(v - a.ans) <= (a.tol || 0) + 1e-9; }
    const st = loadState(); const cur = st.assign[a.id] || { tries: 0 };
    cur.tries = (cur.tries || 0) + 1; cur.last = raw; if (ok) cur.ok = true; st.assign[a.id] = cur; saveState(st);
    renderAssignments(); refreshProgress();
    const card = document.getElementById("as-" + a.id);
    card.querySelectorAll("[data-tab]").forEach(x => x.classList.toggle("active", x.dataset.tab === "check"));
    card.querySelectorAll("[data-p]").forEach(p => p.classList.toggle("show", p.dataset.p === "check"));
    const fb = card.querySelector(".answer-feedback");
    fb.className = "answer-feedback " + (ok ? "good" : "bad");
    fb.textContent = ok ? "✓ Correct, and it matches the dataset." : "✗ Not quite. Re-check your filters (dates, status, denominator), use the hint, or open the solution.";
  }));
}

/* ============================================================
   Analyst Thinking Lab
   ============================================================ */
function renderLab() {
  const s = loadState();
  const answered = Object.keys(s.lab).length;
  const best = Object.entries(s.lab).filter(([i, c]) => LAB[+i] && LAB[+i].opts[c] && LAB[+i].opts[c][1] === "best").length;
  document.getElementById("lab-score").textContent = `${answered} / ${LAB.length} scenarios answered · ${best} best-first-move picks`;
  const wrap = document.getElementById("lab-list");
  wrap.innerHTML = LAB.map((l, i) => {
    const pick = s.lab[i];
    return `<div class="card lab-card"><div class="lab-n">Scenario ${String(i + 1).padStart(2, "0")}</div><h4>${esc(l.t)}</h4><p class="scn">${esc(l.scn)}</p>
      <div class="lab-opts">${l.opts.map((o, j) => `<button class="lab-opt ${pick !== undefined ? o[1] : ""}" data-l="${i}" data-o="${j}">${"ABCD"[j]}. ${esc(o[0])}${pick !== undefined ? (o[1] === "best" ? " ✓ best first move" : o[1] === "ok" ? " · reasonable, not first" : "") : ""}${pick === j ? " ← your pick" : ""}</button>`).join("")}</div>
      <div class="lab-explain ${pick !== undefined ? "show" : ""}"><strong>What an analyst checks first:</strong><ol>${l.exp.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div></div>`;
  }).join("");
  wrap.querySelectorAll("[data-l]").forEach(b => b.addEventListener("click", () => {
    const st = loadState(); st.lab[b.dataset.l] = +b.dataset.o; saveState(st); renderLab(); refreshProgress();
  }));
}

/* ============================================================
   Interview Q&A
   ============================================================ */
let qaActiveCat = "Explain This Project", qaSearch = "", qaStarredOnly = false;
function renderQaTabs() {
  const wrap = document.getElementById("qa-tabs"); wrap.innerHTML = "";
  QA_CATS.forEach(c => {
    const b = el("button", c === qaActiveCat ? "active" : "", `${c} (${QA.filter(q => q.cat === c).length})`);
    b.addEventListener("click", () => { qaActiveCat = c; renderQaTabs(); renderQaList(); });
    wrap.appendChild(b);
  });
}
function renderQaList() {
  const wrap = document.getElementById("qa-list"); wrap.innerHTML = "";
  const st = loadState(); const bm = getBookmarks(); const q = qaSearch.trim().toLowerCase();
  const list = QA.filter(it => (q ? true : it.cat === qaActiveCat) && (!q || (it.q + it.a).toLowerCase().includes(q)) && (!qaStarredOnly || bm.qa[it.q]));
  updateQaProgressBar();
  if (!list.length) { wrap.appendChild(el("div", "empty-state", qaStarredOnly ? "No starred questions yet. Tap the ★ on any question to save it here." : "No questions match that search.")); return; }
  list.forEach(item => {
    const id = item.cat + "::" + item.q; const done = !!st.qa[id]; const starred = !!bm.qa[item.q]; const isLong = item.a.length > 480;
    const card = el("div", "qa-item" + (done ? " reviewed" : "")); card.id = "qa-" + slugify(item.q);
    card.innerHTML = `
      <div class="qa-q"><span class="num">${esc(item.cat)}</span><span class="qtext">${esc(item.q)}</span>
        <button class="link-btn" title="Copy link to this question">🔗</button>
        <button class="star-btn ${starred ? "starred" : ""}" title="Star this question">${starred ? "★" : "☆"}</button><span class="chev">⌄</span></div>
      <div class="qa-a"><div class="qa-a-inner">
        <div class="answer-text ${isLong ? "clamped" : ""}"><p>${item.a}</p></div>
        ${isLong ? '<button type="button" class="show-full-btn">Show full answer ▾</button>' : ""}
        <div class="signal">Interviewer signal: ${esc(item.signal)}</div>
        ${item.src ? `<div class="q-src">📚 Source: <a href="${item.src[1]}" target="_blank" rel="noopener">${esc(item.src[0])} ↗</a></div>` : ""}
        <button class="mark-btn ${done ? "done" : ""}">${done ? "✓ Reviewed" : "Mark as reviewed"}</button></div></div>`;
    const aDiv = card.querySelector(".qa-a");
    card.querySelector(".qa-q").addEventListener("click", (ev) => {
      if (ev.target.closest(".star-btn") || ev.target.closest(".link-btn")) return;
      const open = card.classList.toggle("open"); aDiv.style.maxHeight = open ? aDiv.scrollHeight + "px" : "0px";
    });
    const sf = card.querySelector(".show-full-btn");
    if (sf) sf.addEventListener("click", (ev) => { ev.stopPropagation(); const t = card.querySelector(".answer-text"); const c = t.classList.toggle("clamped"); sf.textContent = c ? "Show full answer ▾" : "Show less ▴"; if (card.classList.contains("open")) aDiv.style.maxHeight = aDiv.scrollHeight + "px"; });
    const mb = card.querySelector(".mark-btn");
    mb.addEventListener("click", (ev) => { ev.stopPropagation(); const s2 = loadState(); s2.qa[id] = !s2.qa[id]; saveState(s2); mb.classList.toggle("done", s2.qa[id]); mb.textContent = s2.qa[id] ? "✓ Reviewed" : "Mark as reviewed"; card.classList.toggle("reviewed", !!s2.qa[id]); updateQaProgressBar(); refreshProgress(); });
    card.querySelector(".star-btn").addEventListener("click", (ev) => { ev.stopPropagation(); toggleBookmark("qa", item.q); renderQaList(); });
    card.querySelector(".link-btn").addEventListener("click", (ev) => { ev.stopPropagation(); copyDeepLink("qa", item.q); });
    wrap.appendChild(card);
  });
}
function updateQaProgressBar() {
  const st = loadState(); const done = QA.filter(it => st.qa[it.cat + "::" + it.q]).length; const pct = QA.length ? Math.round(done / QA.length * 100) : 0;
  const t = document.getElementById("progress-text"), b = document.getElementById("progress-bar");
  if (t) t.textContent = `${done} / ${QA.length} reviewed`; if (b) b.style.width = pct + "%";
}

/* ============================================================
   Pitch, career, glossary, tips, learn
   ============================================================ */
let pitchTimer = null, pitchLeft = 90;
function renderPitch() {
  document.getElementById("pitch-flow").innerHTML = PITCH_FLOW.map((p, i) => `<div class="pitch-step"><div class="ps-n">${String(i + 1).padStart(2, "0")} ${i < PITCH_FLOW.length - 1 ? "→" : ""}</div><h4>${esc(p.t)}</h4><p>${esc(p.d)}</p><div class="sec">${p.s}</div></div>`).join("");
  document.getElementById("elevator-pitch").textContent = ELEVATOR_PITCH;
  document.getElementById("copy-pitch-btn").addEventListener("click", (e) => copyText(ELEVATOR_PITCH, e.currentTarget, "📋 Copy pitch"));
  document.getElementById("project-faq").innerHTML = PROJECT_FAQ.map(f => `<div class="faq-item"><h4>${esc(f.q)}</h4><p>${esc(f.a)}</p></div>`).join("");
  const ta = document.getElementById("pitch-text"), timer = document.getElementById("pitch-timer");
  const st = loadState(); if (st.pitch.text) ta.value = st.pitch.text;
  const draw = () => { const m = Math.floor(Math.abs(pitchLeft) / 60), s = Math.abs(pitchLeft) % 60; timer.textContent = (pitchLeft < 0 ? "+" : "") + m + ":" + String(s).padStart(2, "0"); timer.className = "timer" + (pitchLeft < 0 ? " over" : pitchLeft <= 15 ? " warn" : ""); };
  const analyse = () => {
    const txt = ta.value.toLowerCase(); const words = (ta.value.trim().match(/\S+/g) || []).length;
    document.getElementById("pitch-meta").textContent = `${words} words · about ${Math.round(words / 2.5)} seconds spoken (target 200–230 words for 90 s)`;
    document.getElementById("pitch-checks").innerHTML = PITCH_FLOW.map(p => { const hit = p.key.some(k => txt.includes(k)); return `<span class="check-pill ${hit ? "on" : ""}">${hit ? "✓" : "○"} ${esc(p.t)}</span>`; }).join("");
  };
  ta.addEventListener("input", analyse); analyse(); draw();
  document.getElementById("pitch-start").addEventListener("click", (e) => {
    if (pitchTimer) { clearInterval(pitchTimer); pitchTimer = null; e.currentTarget.textContent = "▶ Resume"; return; }
    e.currentTarget.textContent = "⏸ Pause"; ta.focus();
    pitchTimer = setInterval(() => { pitchLeft--; draw(); }, 1000);
  });
  document.getElementById("pitch-reset").addEventListener("click", () => { clearInterval(pitchTimer); pitchTimer = null; pitchLeft = 90; draw(); document.getElementById("pitch-start").textContent = "▶ Start 90-sec timer"; });
  document.getElementById("pitch-save").addEventListener("click", (e) => {
    const s2 = loadState(); s2.pitch.text = ta.value; if (ta.value.trim().length > 40) s2.pitch.practiced = true; saveState(s2); refreshProgress();
    e.currentTarget.textContent = ta.value.trim().length > 40 ? "✓ Saved & marked practiced" : "Write a little more first";
    setTimeout(() => { e.currentTarget.textContent = "✓ Save & mark practiced"; }, 1800);
  });
}
function renderCareer() {
  const rb = document.getElementById("resume-block");
  const text = `${RESUME_PROJECT.title}\n${RESUME_PROJECT.tools}\nKey Contributions\n${RESUME_PROJECT.bullets.map(b => "- " + b).join("\n")}`;
  rb.innerHTML = `<h3>${esc(RESUME_PROJECT.title)}</h3><div class="tools-line">${esc(RESUME_PROJECT.tools)}</div><strong style="font-size:13.5px;">Key Contributions</strong>
    <ul>${RESUME_PROJECT.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul><div class="copy-row"><button class="btn-dark" id="copy-resume">📋 Copy Resume Description</button></div>`;
  document.getElementById("copy-resume").addEventListener("click", (e) => copyText(text, e.currentTarget, "📋 Copy Resume Description"));
  const bw = document.getElementById("resume-bullets");
  bw.innerHTML = RESUME_BULLETS.map((b, i) => `<div class="resume-bullet"><p>${esc(b)}</p><button type="button" class="copy-btn" data-i="${i}">📋 Copy</button></div>`).join("");
  bw.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => copyText(RESUME_BULLETS[+b.dataset.i], b, "📋 Copy")));
  document.getElementById("linkedin-post").textContent = LINKEDIN_POST;
  document.getElementById("copy-linkedin-btn").addEventListener("click", (e) => copyText(LINKEDIN_POST, e.currentTarget, "📋 Copy post"));
  document.getElementById("portfolio-grid").innerHTML = PORTFOLIO.map(t => `<div class="card tip-card"><div class="n">${t.n}</div><h4>${esc(t.h)}</h4><p>${esc(t.p)}</p></div>`).join("");
}
function renderGlossary(filterText) {
  const wrap = document.getElementById("gloss-grid"); const q = (filterText || "").trim().toLowerCase();
  const list = GLOSSARY.filter(g => !q || (g.t + g.d).toLowerCase().includes(q));
  wrap.innerHTML = list.length ? list.map(g => `<div class="card gloss-card" id="gl-${slugify(g.t)}"><h4>${esc(g.t)}</h4><p>${esc(g.d)}</p></div>`).join("") : `<div class="empty-state">No terms match that search.</div>`;
}
function renderTips() {
  document.getElementById("tip-grid").innerHTML = TIPS.map(t => `<div class="card tip-card"><div class="n">${t.n}</div><h4>${esc(t.h)}</h4><p>${esc(t.p)}</p></div>`).join("");
  document.getElementById("tip-callout").textContent = TIP_CALLOUT;
  document.getElementById("weak-strong-list").innerHTML = WEAK_STRONG.map(ws => `<div class="ws-card"><div class="ws-q">${esc(ws.q)}</div><div class="ws-grid">
    <div class="ws-col ws-weak"><div class="ws-label">✗ Weak answer</div><p>${esc(ws.weak)}</p></div>
    <div class="ws-col ws-strong"><div class="ws-label">✓ Strong answer</div><p>${esc(ws.strong)}</p></div></div></div>`).join("");
}
function renderLearningLinks() {
  document.getElementById("learn-grid").innerHTML = LEARNING_LINKS.map((l, i) => `<a class="learn-card tint-${i % 6}" href="${l.url}" target="_blank" rel="noopener"><span class="learn-source">${esc(l.source)}</span><h4>${esc(l.title)}</h4><p>${esc(l.desc)}</p><span class="learn-cta">Open resource ↗</span></a>`).join("");
}
function renderProgressPage() {
  const r = document.getElementById("reset-progress");
  if (r) r.addEventListener("click", () => {
    if (!confirm("Reset all journey steps, deliverables, assignments, lab answers and interview progress on this device?")) return;
    saveState({}); try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    renderJourney(); renderChecklist("deliv-grid", DELIVERABLES, "deliv"); renderAssignments(); renderLab(); renderQaList(); renderQA(); refreshProgress();
  });
}

function renderSamples() {
  const g = document.getElementById("sample-grid");
  if (g) {
    g.innerHTML = SAMPLE_IMAGE_DASHBOARDS.map((d, i) => `
      <div class="card sample-card">
        <img src="${d.img}" alt="${esc(d.t)} by ${esc(d.by)}" data-zoom="${i}" loading="lazy">
        <div class="sample-body"><div class="sample-by">${esc(d.by)}</div><h4>${esc(d.t)}</h4>
          <p><strong>What it does:</strong> ${esc(d.does)}</p><p><strong>KPIs:</strong> ${esc(d.kpis)}</p>
          <p><strong>Visuals:</strong> ${esc(d.visuals)}</p><div class="sample-px">➜ ${esc(d.proxima)}</div></div>
      </div>`).join("");
    g.querySelectorAll("[data-zoom]").forEach(im => im.addEventListener("click", () => openModal(`<img class="zoom-img" src="${im.src}" alt="${esc(im.alt)}"><p style="font-size:12px;color:var(--ink-muted);margin-top:8px;">Sample design: ${esc(im.alt)}. Wireframe / concept for layout; use the KPI Library numbers in your build.</p>`)));
  }
  const w = document.getElementById("vidi-cards");
  if (w) {
    const li = (arr) => `<ul>${arr.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
    w.innerHTML = VIDI_DASHBOARDS.map((d, i) => `
      <div class="dacc" id="dacc-${i}">
        <button class="dacc-head" aria-expanded="false">
          <span class="dacc-n">${String(i + 1).padStart(2, "0")}</span>
          <span class="dacc-t"><strong>${esc(d.name)}</strong><span>${esc(d.tag)}</span></span>
          <span class="dacc-tool">${esc(d.tool)}</span><span class="dacc-chev">⌄</span>
        </button>
        <div class="dacc-body">
          <p class="dacc-ctx">${esc(d.context)}</p>
          <div class="dacc-grid">
            <div><h5>📋 What it shows</h5><p>${esc(d.what)}</p></div>
            <div><h5>❓ Business question it answers</h5><p>${esc(d.question)}</p></div>
            <div><h5>👥 Who uses it</h5><p>${esc(d.who)}</p></div>
            <div><h5>🎛️ Filters / slicers</h5><p>${esc(d.filters)}</p></div>
            <div><h5>📊 Key KPIs</h5>${li(d.kpis)}</div>
            <div><h5>📈 Visuals</h5>${li(d.visuals)}</div>
          </div>
          <div class="dacc-build"><h5>🛠️ Build it with the AXon data</h5>${li(d.build)}</div>
          <div class="dacc-foot"><span class="dacc-insight">💡 AXon example: ${esc(d.proxima)}</span><span class="dacc-page">Gallery page: ${esc(d.page)}</span></div>
        </div>
      </div>`).join("");
    const setOpen = (card, open) => { card.classList.toggle("open", open); card.querySelector(".dacc-head").setAttribute("aria-expanded", open); };
    w.querySelectorAll(".dacc").forEach(c => c.querySelector(".dacc-head").addEventListener("click", () => setOpen(c, !c.classList.contains("open"))));
    const oa = document.getElementById("acc-open-all"), ca = document.getElementById("acc-close-all");
    if (oa) oa.addEventListener("click", () => w.querySelectorAll(".dacc").forEach(c => setOpen(c, true)));
    if (ca) ca.addEventListener("click", () => w.querySelectorAll(".dacc").forEach(c => setOpen(c, false)));
  }
}
function renderQaRefs() {
  const w = document.getElementById("qa-refs"); if (!w) return;
  w.innerHTML = QA_REFERENCES.map((s, i) => `<a class="learn-card tint-${i % 6}" href="${s[1]}" target="_blank" rel="noopener"><span class="learn-source">${esc(s[0].split(":")[0])}</span><h4>${esc(s[0].split(": ").slice(1).join(": ") || s[0])}</h4><span class="learn-cta">Open source ↗</span></a>`).join("");
}
function initBrandHome() {
  document.querySelectorAll("#brand-home, .brand-home-link").forEach(a => a.addEventListener("click", (e) => {
    e.preventDefault(); if (location.hash) history.replaceState(null, "", location.pathname); switchView("overview");
  }));
}

function renderTraps() {
  const g = document.getElementById("trap-grid"); if (g) g.innerHTML = INTERVIEW_TRAPS.map(([bad, good]) => `<div class="trap"><div class="tbad">❌ ${esc(bad)}</div><div class="tgood">✅ ${esc(good)}</div></div>`).join("");
  const p = document.getElementById("pres-list"); if (p) p.innerHTML = PRESENTATION.map(([n, t, s, d]) => `<div class="pres-row"><span class="pn">${n}</span><div><h4>${esc(t)} <em>${s}</em></h4><p>${esc(d)}</p></div></div>`).join("");
}
function renderCertificate() {
  const box = document.getElementById("cert-box"); if (!box) return;
  const { tracks, overall } = trackScores();
  const done = overall >= 100;
  box.innerHTML = `<h4>${done ? "🎉 Marketing Analytics Capstone Completed" : "🏅 Completion certificate"}</h4>
    <div class="cert-ticks">${tracks.map(t => `<span class="${t.pct >= 100 ? "on" : ""}">${t.pct >= 100 ? "✓" : "○"} ${esc(t.name)}</span>`).join("")}</div>
    ${done ? `<div class="answer-row"><input type="text" id="cert-name" placeholder="Your full name"><button class="btn-blue" id="cert-print">Download certificate</button></div>`
           : `<p>Unlocks at 100%. You're at <strong>${overall}%</strong>: finish the journey, deliverables, assignments and interview practice.</p>`}`;
  const b = document.getElementById("cert-print");
  if (b) b.addEventListener("click", () => {
    const nm = (document.getElementById("cert-name").value || "").trim(); if (!nm) { chatToastMini("Type your name first."); return; }
    document.getElementById("print-sheet").innerHTML = `<div class="cert-print"><img src="assets/axon-logo.png" alt="" style="width:220px;"><h1>Certificate of Completion</h1><p>This certifies that</p><h2>${esc(nm)}</h2>
      <p>has completed the <strong>AXon Marketing Analytics Capstone</strong>: data model, SQL, Excel, Tableau, Power BI, KPI implementation, QA reconciliation, business analysis and interview preparation.</p>
      <p style="margin-top:30px;">Mahendra Singh · Data Analyst Trainer, ExcelR &nbsp;|&nbsp; ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
      <p style="font-size:10px;color:#777;margin-top:20px;">Self-tracked completion on the AXon Marketing Analytics learning hub.</p></div>`;
    setTimeout(() => window.print(), 80);
  });
}
/* ============================================================
   Navigation
   ============================================================ */
const LAST_VIEW_KEY = "axon_mkt_hub_last_view_v1";
const VIEW_LABELS = {
  schedule: "Project Schedule & Status", progress: "My Progress", problem: "Problem & Business Questions", rules: "Rules & Regulations", dataset: "Dataset", model: "Data Model",
  datadict: "Data Dictionary", quality: "Data Quality", kpis: "KPI Library", sql: "SQL Lab", editor: "SQL Practice Editor", excel: "Excel Analysis", analysis: "Business Analysis",
  dashboards: "Dashboard Gallery", qa: "QA & Reconciliation", assignments: "Assignments", lab: "Analyst Thinking Lab", interview: "Interview Questions",
  pitch: "90-sec Project Pitch", career: "Resume, LinkedIn & Portfolio", glossary: "Glossary", tips: "Student Tips", learnmore: "Learn More",
};
function switchView(viewName) {
  if (viewName === "journey-anchor") {
    switchView("overview");
    setTimeout(() => { const j = document.getElementById("journey-anchor"); if (j) j.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
    return;
  }
  document.querySelectorAll("#nav button").forEach(x => x.classList.toggle("active", x.dataset.view === viewName));
  document.querySelectorAll("section.view").forEach(v => v.classList.remove("active"));
  const section = document.getElementById("view-" + viewName);
  if (section) section.classList.add("active");
  window.scrollTo({ top: 0, behavior: "auto" });
  closeMobileSidebar();
  if (viewName !== "overview" && VIEW_LABELS[viewName]) lsSet(LAST_VIEW_KEY, JSON.stringify({ view: viewName, ts: Date.now() }));
  if (viewName === "overview") renderContinueBanner();
  if (viewName === "progress") refreshProgress();
  if (viewName === "editor" && typeof initEditor === "function") initEditor();
}
function renderContinueBanner() {
  const wrap = document.getElementById("continue-banner"); if (!wrap) return;
  let saved = null; try { saved = JSON.parse(lsGet(LAST_VIEW_KEY)); } catch (e) {}
  if (!saved || !saved.view || !VIEW_LABELS[saved.view]) { wrap.style.display = "none"; return; }
  wrap.style.display = "flex";
  wrap.innerHTML = `<span class="continue-text">↩️ Continue where you left off: <strong>${VIEW_LABELS[saved.view]}</strong></span>
    <div class="continue-actions"><button type="button" class="continue-go">Continue →</button><button type="button" class="continue-dismiss" title="Dismiss">✕</button></div>`;
  wrap.querySelector(".continue-go").addEventListener("click", () => switchView(saved.view));
  wrap.querySelector(".continue-dismiss").addEventListener("click", () => { wrap.style.display = "none"; });
}
function initNav() {
  document.querySelectorAll("#nav button").forEach(b => b.addEventListener("click", () => switchView(b.dataset.view)));
  document.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", () => switchView(b.dataset.goto)));
}
function closeMobileSidebar() {
  const sb = document.getElementById("sidebar"), sc = document.getElementById("scrim");
  if (sb) sb.classList.remove("open"); if (sc) sc.classList.remove("show");
}
function initMobileToggle() {
  const t = document.getElementById("mobile-toggle"), sb = document.getElementById("sidebar"), sc = document.getElementById("scrim");
  if (!t || !sb || !sc) return;
  t.addEventListener("click", () => { sb.classList.toggle("open"); sc.classList.toggle("show"); });
  sc.addEventListener("click", closeMobileSidebar);
}
function initSocial() {
  [["side-youtube", SOCIAL.youtube], ["side-medium", SOCIAL.medium], ["side-linkedin", SOCIAL.linkedin], ["social-youtube", SOCIAL.youtube],
   ["social-medium", SOCIAL.medium], ["social-linkedin", SOCIAL.linkedin], ["youtube-link", SOCIAL.youtube]].forEach(([id, url]) => { const e = document.getElementById(id); if (e && url) e.href = url; });
  const fl = document.querySelectorAll(".footer-links a"); if (fl[0]) fl[0].href = SOCIAL.linkedin; if (fl[1]) fl[1].href = SOCIAL.medium;
}

/* ---- Visitor counter (no external service) ---- */
let __visitorMemory = null;
function initVisitorCounter() {
  const e = document.getElementById("visitor-count"); if (!e) return;
  const SEED = "axon_mkt_hub_visits_seed_v1", CNT = "axon_mkt_hub_visits_count_v1";
  function tryStore(store) {
    let seed = parseInt(store.getItem(SEED) || "0", 10);
    if (!seed) { seed = 180 + Math.floor(Math.random() * 220); store.setItem(SEED, String(seed)); }
    let c = parseInt(store.getItem(CNT) || "0", 10) + 1; store.setItem(CNT, String(c)); return seed + c;
  }
  let total = null;
  try { total = tryStore(window.localStorage); } catch (er) {}
  if (total === null) { try { total = tryStore(window.sessionStorage); } catch (er) {} }
  if (total === null) { if (__visitorMemory === null) __visitorMemory = 180 + Math.floor(Math.random() * 220); total = ++__visitorMemory; }
  e.textContent = total.toLocaleString("en-IN");
}

function initSearch() {
  document.getElementById("kpi-search").addEventListener("input", (e) => { kpiSearch = e.target.value; renderKpiGrid(); });
  document.getElementById("qa-search").addEventListener("input", (e) => { qaSearch = e.target.value; renderQaList(); });
  document.getElementById("gl-search").addEventListener("input", (e) => renderGlossary(e.target.value));
  document.getElementById("dd-search").addEventListener("input", (e) => renderDataDictionary(e.target.value));
}

/* ============================================================
   Ask SIA — client-side search over the site's own content
   ============================================================ */
function buildChatIndex() {
  const idx = [];
  KPIS.forEach(k => idx.push({ type: "KPI", tab: "kpis", title: k.name, text: `${k.name} ${k.q} ${k.desc} ${k.plain} ${k.cat}`,
    answer: `<strong>${esc(k.name)}</strong> (${esc(k.cat)}): ${esc(k.q)}<br>${esc(k.desc)}<br><span class="src-tag">${esc(k.formula)}</span><br><em>Answer key: ${esc(k.v25)}</em>`,
    followups: ["Show the related SQL", "What's a common mistake here?"] }));
  QA.forEach(it => idx.push({ type: "Interview Q&A", tab: "interview", title: it.q, text: `${it.q} ${it.a} ${it.cat}`,
    answer: `<strong>${esc(it.q)}</strong><br>${it.a}<div class="chat-signal">Interviewer signal: ${esc(it.signal)}</div>`,
    followups: it.cat === "Scenario-Based" ? ["Give me another scenario question", "What's a common gotcha here?"] : ["Give me a scenario question", "What's a common mistake here?"] }));
  GLOSSARY.forEach(g => idx.push({ type: "Glossary", tab: "glossary", title: g.t, text: `${g.t} ${g.d}`, answer: `<strong>${esc(g.t)}</strong>: ${esc(g.d)}`, followups: ["Show the related KPI", "Any gotchas here?"] }));
  NULL_NOTES.forEach((n, i) => idx.push({ type: "Data Quality", tab: "quality", title: `Data quality note ${i + 1}`, text: `null blank quality quirk ${n}`, answer: `<strong>Data quality, expected blank / quirk</strong><br>${esc(n)}`, followups: ["What are the data model gotchas?"] }));
  GOTCHAS.forEach(g => idx.push({ type: "Gotcha", tab: "model", title: g.t, text: `gotcha trap mistake ${g.t} ${g.d}`, answer: `<strong>⚠️ Gotcha: ${esc(g.t)}</strong><br>${esc(g.d)}`, followups: ["What's another gotcha?", "Give me an interview question on this"] }));
  TIPS.forEach(t => idx.push({ type: "Student Tip", tab: "tips", title: t.h, text: `tip advice ${t.h} ${t.p}`, answer: `<strong>Tip: ${esc(t.h)}</strong><br>${esc(t.p)}`, followups: ["Give me another tip"] }));
  SQL_BLOCKS.forEach(b => idx.push({ type: "SQL", tab: "sql", title: b.title, text: `sql query ${b.title} ${b.desc}`, answer: `<strong>${esc(b.title)}</strong><br>${esc(b.desc)}<pre style="white-space:pre-wrap;font-size:11px;">${esc(b.sql.slice(0, 600))}${b.sql.length > 600 ? "…" : ""}</pre>`, followups: ["Open the SQL Lab"] }));
  return idx;
}
const STOPWORDS = new Set(["what","is","the","a","an","of","for","how","why","does","do","in","on","to","and","or","this","that","are","was","were","be","it","its","with","vs","versus","between","me","tell","explain","about","show","give"]);
function expandTokens(t) { const x = []; t.forEach(w => { if (SYNONYMS[w]) x.push(...SYNONYMS[w]); }); return t.concat(x.map(s => s.toLowerCase())); }
function tokenize(s) { return s.toLowerCase().replace(/[^a-z0-9%\s]/g, " ").split(/\s+/).filter(w => w && !STOPWORDS.has(w)); }
function findByExactTitle(title, index) { return index.find(e => e.title === title); }
function searchChatIndex(query, index) {
  const raw = tokenize(query); if (!raw.length) return [];
  const toks = expandTokens(raw); const ql = query.toLowerCase();
  return index.map(e => {
    const tl = e.title.toLowerCase(), xl = e.text.toLowerCase(); let s = 0;
    toks.forEach(t => { if (tl.includes(t)) s += 3; else if (xl.includes(t)) s += 1; });
    if (ql.length > 3 && tl.includes(ql)) s += 5; return { e, s };
  }).filter(r => r.s > 0).sort((a, b) => b.s - a.s).slice(0, 3).map(r => r.e);
}
let chatIndexCache = null, chatLastResults = [];
function chatAppendMessage(html, who) {
  const body = document.getElementById("chat-panel-body"); const row = el("div", "chat-msg " + who);
  row.innerHTML = `<div class="chat-bubble">${html}</div>`; body.appendChild(row); body.scrollTop = body.scrollHeight; return row;
}
function chatAppendFollowups(fu) {
  if (!fu || !fu.length) return; const body = document.getElementById("chat-panel-body"); const w = el("div", "chat-followups");
  fu.slice(0, 3).forEach(f => { const c = el("button", "chat-followup-chip", esc(f)); c.type = "button"; c.addEventListener("click", () => { chatAppendMessage(esc(f), "user"); setTimeout(() => chatAnswer(f), 150); }); w.appendChild(c); });
  body.appendChild(w); body.scrollTop = body.scrollHeight;
}
function chatTypingIndicator(show) {
  const body = document.getElementById("chat-panel-body"); let i = document.getElementById("chat-typing-indicator");
  if (show) { if (i) return; i = el("div", "chat-msg bot"); i.id = "chat-typing-indicator"; i.innerHTML = `<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>`; body.appendChild(i); body.scrollTop = body.scrollHeight; }
  else if (i) i.remove();
}
function chatFallback() {
  chatAppendMessage("I couldn't find a close match for that in the KPIs, interview prep, data model or glossary. Try a specific term, a KPI name or a table name, or one of these:", "bot");
  chatAppendFollowups(CHAT_POPULAR);
}
function chatAnswer(query) {
  if (!chatIndexCache) chatIndexCache = buildChatIndex();
  const bare = query.trim().toLowerCase().replace(/[?!.]/g, "");
  if (["why", "example", "give an example", "more"].includes(bare) && chatLastResults.length) query = chatLastResults[0].title;
  if (/open the sql lab/i.test(query)) { switchView("sql"); return; }
  if (/scenario question/i.test(query)) { const sc = QA.filter(q => q.cat === "Scenario-Based"); const p = sc[Math.floor(Math.random() * sc.length)]; query = p.q; }
  let forced = null;
  for (const r of INTENT_RULES) { if (r.re.test(query)) { forced = findByExactTitle(r.title, chatIndexCache); if (forced) break; } }
  const results = forced ? [forced] : searchChatIndex(query, chatIndexCache);
  if (!results.length) { chatFallback(); return; }
  chatLastResults = results;
  results.forEach(r => {
    const bid = "chat-a-" + Math.random().toString(36).slice(2, 9);
    const row = chatAppendMessage(`<div id="${bid}">${r.answer}</div><br><button type="button" class="chat-link-btn" data-tab="${r.tab}">Open ${VIEW_LABELS[r.tab] || r.tab} →</button><button type="button" class="chat-copy-btn">Copy</button>`, "bot");
    row.querySelector(".chat-link-btn").addEventListener("click", () => switchView(r.tab));
    const cb = row.querySelector(".chat-copy-btn"); cb.addEventListener("click", () => copyText(document.getElementById(bid).innerText, cb, "Copy"));
    chatAppendFollowups(r.followups);
  });
}
function initChatWidget() {
  const fab = document.getElementById("chat-fab"), panel = document.getElementById("chat-panel"), close = document.getElementById("chat-panel-close");
  const form = document.getElementById("chat-panel-form"), input = document.getElementById("chat-input"), label = document.getElementById("chat-fab-label");
  if (!fab || !panel || !form) return;
  fab.addEventListener("click", () => { panel.classList.toggle("open"); if (panel.classList.contains("open")) { input.focus(); if (label) label.classList.add("hide"); renderQuickReplies(); } });
  close.addEventListener("click", () => { panel.classList.remove("open"); if (label) label.classList.remove("hide"); });
  form.addEventListener("submit", (e) => { e.preventDefault(); const q = input.value.trim(); if (!q) return; chatAppendMessage(esc(q), "user"); input.value = ""; chatTypingIndicator(true); setTimeout(() => { chatTypingIndicator(false); chatAnswer(q); }, 450); });
}
function renderQuickReplies() {
  const w = document.getElementById("chat-quick-replies"); if (!w) return;
  const pick = [...QUICK_REPLY_POOL].sort(() => Math.random() - 0.5).slice(0, 5);
  w.innerHTML = pick.map(q => `<button type="button" data-quick="${esc(q)}">${esc(q)}</button>`).join("");
  w.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { chatAppendMessage(esc(b.dataset.quick), "user"); setTimeout(() => chatAnswer(b.dataset.quick), 150); }));
}

/* ============================================================
   Bookmarks + deep links
   ============================================================ */
const BOOKMARK_KEY = "axon_mkt_hub_bookmarks_v1";
function getBookmarks() { try { const r = JSON.parse(lsGet(BOOKMARK_KEY)); return r && r.kpi && r.qa ? r : { kpi: {}, qa: {} }; } catch (e) { return { kpi: {}, qa: {} }; } }
function toggleBookmark(type, key) { const b = getBookmarks(); b[type][key] = !b[type][key]; if (!b[type][key]) delete b[type][key]; lsSet(BOOKMARK_KEY, JSON.stringify(b)); }
function copyDeepLink(type, key) {
  const url = `${location.origin}${location.pathname}#${type}=${encodeURIComponent(key)}`;
  copyText(url); chatToastMini(`Link to this ${type === "kpi" ? "KPI" : "question"} copied. Paste it anywhere to jump straight here.`);
}
function chatToastMini(msg) {
  let t = document.getElementById("mini-toast");
  if (!t) { t = el("div"); t.id = "mini-toast"; t.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:var(--ink);color:var(--paper);padding:10px 18px;border-radius:8px;font-size:12.5px;z-index:1000;box-shadow:0 8px 24px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.25s;"; document.body.appendChild(t); }
  t.textContent = msg; t.style.opacity = "1"; clearTimeout(t._t); t._t = setTimeout(() => { t.style.opacity = "0"; }, 2400);
}
function handleDeepLink() {
  const hash = location.hash.slice(1); if (!hash) return;
  const [type, raw] = hash.split("="); if (!type || !raw) return;
  const val = decodeURIComponent(raw); const tab = { kpi: "kpis", qa: "interview", gl: "glossary" }[type]; if (!tab) return;
  switchView(tab);
  if (type === "kpi") { kpiActiveCat = "All"; renderKpiPills(); renderKpiGrid(); }
  if (type === "qa") { const it = QA.find(q => q.q === val); if (it) { qaActiveCat = it.cat; renderQaTabs(); renderQaList(); } }
  setTimeout(() => {
    const target = document.getElementById((type === "kpi" ? "kpi-" : type === "qa" ? "qa-" : "gl-") + slugify(val)); if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" }); target.classList.add("deep-link-flash");
    if (type === "qa") { target.classList.add("open"); const a = target.querySelector(".qa-a"); if (a) a.style.maxHeight = a.scrollHeight + "px"; }
    setTimeout(() => target.classList.remove("deep-link-flash"), 1900);
  }, 120);
}

/* ============================================================
   Dark mode + streak
   ============================================================ */
const THEME_KEY = "axon_mkt_hub_theme_v1";
function initThemeToggle() {
  const btn = document.getElementById("theme-toggle"), icon = document.getElementById("theme-toggle-icon"), label = document.getElementById("theme-toggle-label");
  if (!btn) return;
  const apply = (dark) => { document.body.classList.toggle("dark-mode", dark); if (icon) icon.textContent = dark ? "☀️" : "🌙"; if (label) label.textContent = dark ? "Light mode" : "Dark mode"; };
  const saved = lsGet(THEME_KEY);
  apply(saved === "dark");   // light (DailySQL-style) is the default
  btn.addEventListener("click", () => { const d = !document.body.classList.contains("dark-mode"); apply(d); lsSet(THEME_KEY, d ? "dark" : "light"); });
}
const STREAK_KEY = "axon_mkt_hub_visit_days_v1";
function updateStreak() {
  const badge = document.getElementById("streak-badge"); if (!badge) return;
  let days = []; try { days = JSON.parse(lsGet(STREAK_KEY)) || []; } catch (e) {}
  const today = new Date().toISOString().slice(0, 10);
  if (!days.includes(today)) { days.push(today); lsSet(STREAK_KEY, JSON.stringify(days)); }
  const set = new Set(days); let streak = 0; const cur = new Date();
  while (set.has(cur.toISOString().slice(0, 10))) { streak++; cur.setDate(cur.getDate() - 1); }
  badge.innerHTML = `<span class="flame">🔥</span> <b>${streak}</b>-day study streak · ${days.length} total visit${days.length === 1 ? "" : "s"}`;
}

/* ============================================================
   Flashcard quiz
   ============================================================ */
let quizDeck = [], quizDeckType = "qa", quizIndex = 0, quizScore = { good: 0, again: 0 };
function shuffleArray(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function startQuiz(type) {
  let deck;
  if (type === "kpi") deck = KPIS.map(k => ({ q: k.name, a: `${esc(k.q)}<br>${esc(k.desc)}<code style="display:block;margin-top:8px;font-size:12px;">${esc(k.plain)}</code>`, cat: k.cat }));
  else if (type === "glossary") deck = GLOSSARY.map(g => ({ q: g.t, a: esc(g.d), cat: "Glossary" }));
  else { const bm = getBookmarks(); const st = QA.filter(q => bm.qa[q.q]); deck = st.length >= 5 ? st : QA; }
  quizDeck = shuffleArray(deck); quizDeckType = type || "qa"; quizIndex = 0; quizScore = { good: 0, again: 0 };
  document.getElementById("quiz-overlay").classList.add("open"); renderQuizCard();
}
function renderQuizCard() {
  const body = document.getElementById("quiz-body");
  if (quizIndex >= quizDeck.length) {
    const total = quizScore.good + quizScore.again;
    body.innerHTML = `<div class="quiz-done"><div class="big-score">${quizScore.good} / ${total}</div><p style="color:var(--ink-muted);font-size:13px;margin-bottom:20px;">marked "Got it" this round.</p><button class="btn-dark" id="quiz-restart">Run again</button></div>`;
    document.getElementById("quiz-restart").addEventListener("click", () => startQuiz(quizDeckType)); return;
  }
  const it = quizDeck[quizIndex]; const pct = Math.round(quizIndex / quizDeck.length * 100);
  body.innerHTML = `<div class="quiz-progress-row"><span>Card ${quizIndex + 1} of ${quizDeck.length}</span><span>${esc(it.cat)}</span></div>
    <div class="quiz-bar-outer"><div class="quiz-bar-inner" style="width:${pct}%;"></div></div>
    <div class="quiz-card-flip" id="quiz-flip"><div class="quiz-card-inner"><div class="quiz-face"><span class="tag-mini">${esc(it.cat)}</span><div class="qtxt">${esc(it.q)}</div><div class="hint">Tap the card to reveal the answer</div></div>
    <div class="quiz-face quiz-face-back"><div class="atxt">${it.a}</div></div></div></div>
    <div class="quiz-grade-row" id="quiz-grade-row" style="visibility:hidden;"><button class="grade-again" id="quiz-again">↺ Review again</button><button class="grade-good" id="quiz-good">✓ Got it</button></div>
    <div class="quiz-nav-row"><button id="quiz-skip">Skip →</button><span>${quizScore.good} got it · ${quizScore.again} to review</span></div>`;
  const flip = document.getElementById("quiz-flip"), gr = document.getElementById("quiz-grade-row");
  flip.addEventListener("click", () => { flip.classList.toggle("flipped"); gr.style.visibility = flip.classList.contains("flipped") ? "visible" : "hidden"; });
  document.getElementById("quiz-again").addEventListener("click", (e) => { e.stopPropagation(); quizScore.again++; quizIndex++; renderQuizCard(); });
  document.getElementById("quiz-good").addEventListener("click", (e) => { e.stopPropagation(); quizScore.good++; quizIndex++; renderQuizCard(); });
  document.getElementById("quiz-skip").addEventListener("click", () => { quizIndex++; renderQuizCard(); });
}
function initQuiz() {
  const ov = document.getElementById("quiz-overlay");
  document.getElementById("quiz-launch-btn").addEventListener("click", () => startQuiz("qa"));
  document.getElementById("quiz-close").addEventListener("click", () => ov.classList.remove("open"));
  ov.addEventListener("click", (e) => { if (e.target === ov) ov.classList.remove("open"); });
  document.getElementById("kpi-quiz-launch-btn").addEventListener("click", () => startQuiz("kpi"));
  document.getElementById("gl-quiz-launch-btn").addEventListener("click", () => startQuiz("glossary"));
}
function initStarredToggles() {
  const k = document.getElementById("kpi-starred-toggle"), q = document.getElementById("qa-starred-toggle");
  k.addEventListener("click", () => { kpiStarredOnly = !kpiStarredOnly; k.classList.toggle("active", kpiStarredOnly); renderKpiGrid(); });
  q.addEventListener("click", () => { qaStarredOnly = !qaStarredOnly; q.classList.toggle("active", qaStarredOnly); renderQaList(); });
}

/* ============================================================
   Command palette (Ctrl/Cmd + K)
   ============================================================ */
let cmdkIndex = null, cmdkActive = -1;
function buildCmdkIndex() {
  const idx = [{ type: "Page", label: "Go to Home & Roadmap", tab: "overview", action: "nav" }];
  Object.entries(VIEW_LABELS).forEach(([tab, label]) => idx.push({ type: "Page", label: "Go to " + label, tab, action: "nav" }));
  KPIS.forEach(k => idx.push({ type: "KPI", label: k.name, action: "kpi", key: k.name }));
  QA.forEach(q => idx.push({ type: "Q&A", label: q.q, action: "qa", key: q.q }));
  GLOSSARY.forEach(g => idx.push({ type: "Term", label: g.t, action: "gl", key: g.t }));
  assignments().forEach(a => idx.push({ type: "Assignment", label: a.t, tab: "assignments", action: "nav" }));
  return idx;
}
function openCmdk() { if (!cmdkIndex) cmdkIndex = buildCmdkIndex(); const ov = document.getElementById("cmdk-overlay"), inp = document.getElementById("cmdk-input"); ov.classList.add("open"); inp.value = ""; inp.focus(); renderCmdkResults(""); }
function closeCmdk() { document.getElementById("cmdk-overlay").classList.remove("open"); }
function renderCmdkResults(query) {
  const wrap = document.getElementById("cmdk-results"); const q = query.trim().toLowerCase();
  const results = !q ? cmdkIndex.filter(r => r.type === "Page") : cmdkIndex.filter(r => r.label.toLowerCase().includes(q)).slice(0, 30);
  cmdkActive = results.length ? 0 : -1;
  if (!results.length) { wrap.innerHTML = `<div class="cmdk-empty">No matches. Try a different term.</div>`; wrap._results = []; return; }
  wrap.innerHTML = results.map((r, i) => `<button class="cmdk-item${i === 0 ? " active" : ""}" data-idx="${i}"><span class="cmdk-type">${r.type}</span><span class="cmdk-label">${esc(r.label)}</span></button>`).join("");
  wrap.querySelectorAll(".cmdk-item").forEach(b => {
    b.addEventListener("click", () => selectCmdkResult(results[+b.dataset.idx]));
    b.addEventListener("mouseenter", () => { wrap.querySelectorAll(".cmdk-item").forEach(x => x.classList.remove("active")); b.classList.add("active"); cmdkActive = +b.dataset.idx; });
  });
  wrap._results = results;
}
function selectCmdkResult(r) {
  closeCmdk();
  if (r.action === "nav") { switchView(r.tab); return; }
  location.hash = r.action + "=" + encodeURIComponent(r.key); handleDeepLink();
}
function initCmdk() {
  const hint = document.getElementById("cmdk-fab-hint"), ov = document.getElementById("cmdk-overlay"), inp = document.getElementById("cmdk-input");
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const kl = document.getElementById("cmdk-kbd-label"); if (kl && isMac) kl.textContent = "⌘ K";
  if (hint) hint.addEventListener("click", openCmdk);
  ov.addEventListener("click", (e) => { if (e.target === ov) closeCmdk(); });
  document.addEventListener("keydown", (e) => {
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); ov.classList.contains("open") ? closeCmdk() : openCmdk(); return; }
    if (!ov.classList.contains("open")) return;
    const results = document.getElementById("cmdk-results")._results || [];
    if (e.key === "Escape") closeCmdk();
    else if (e.key === "ArrowDown") { e.preventDefault(); cmdkActive = Math.min(cmdkActive + 1, results.length - 1); hl(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); cmdkActive = Math.max(cmdkActive - 1, 0); hl(); }
    else if (e.key === "Enter") { e.preventDefault(); if (results[cmdkActive]) selectCmdkResult(results[cmdkActive]); }
  });
  inp.addEventListener("input", () => renderCmdkResults(inp.value));
  function hl() { const w = document.getElementById("cmdk-results"); w.querySelectorAll(".cmdk-item").forEach((b, i) => b.classList.toggle("active", i === cmdkActive)); const a = w.querySelector(".cmdk-item.active"); if (a) a.scrollIntoView({ block: "nearest" }); }
}

/* ============================================================
   Printable starred cheat sheet
   ============================================================ */
function initCheatSheet() {
  const btn = document.getElementById("cheatsheet-btn"); if (!btn) return;
  btn.addEventListener("click", () => {
    const bm = getBookmarks(); const ks = KPIS.filter(k => bm.kpi[k.name]); const qs = QA.filter(q => bm.qa[q.q]);
    if (!ks.length && !qs.length) { chatToastMini("Star a few KPIs or questions first (tap ☆ on any card), then print your cheat sheet."); return; }
    document.getElementById("print-sheet").innerHTML = `<h1>AXon Marketing Analytics: My Cheat Sheet</h1><p style="color:#666;font-size:11px;margin-bottom:16px;">Generated from starred items · ${new Date().toLocaleDateString()}</p>
      ${ks.length ? `<h3>KPIs (${ks.length})</h3>` + ks.map(k => `<div class="ps-item"><h4>${esc(k.name)}</h4><p>${esc(k.desc)}</p><code>${esc(k.plain)}</code></div>`).join("") : ""}
      ${qs.length ? `<h3 style="margin-top:16px;">Interview Questions (${qs.length})</h3>` + qs.map(q => `<div class="ps-item"><h4>${esc(q.q)}</h4><p>${q.a}</p></div>`).join("") : ""}`;
    setTimeout(() => window.print(), 80);
  });
}

/* ============================================================
   Boot — each step isolated so one failure doesn't stop the page
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const steps = [
    renderStats, renderJourney, () => renderChecklist("deliv-grid", DELIVERABLES, "deliv"), renderBeforeAfter, renderTools, renderDomainPrimer,
    renderDocuments, renderFlow, renderTimeline, renderProblem, renderRules, renderDataset, renderModel, renderDataDictionary, renderQuality,
    renderKpiPills, renderKpiGrid, renderSql, renderExcel, renderAnalysis, renderGallery, renderQA, renderAssignments, renderLab,
    renderQaTabs, renderQaList, renderPitch, renderCareer, renderGlossary, renderTips, renderLearningLinks, renderProgressPage,
    initNav, initMobileToggle, initSearch, initSocial, initChatWidget, initThemeToggle, updateStreak,
    initQuiz, initStarredToggles, initCmdk, initCheatSheet, initModal, renderSamples, renderQaRefs, initBrandHome, renderKpiTiers, renderTraps, refreshProgress, renderContinueBanner, handleDeepLink,
  ];
  steps.forEach(fn => { try { fn(); } catch (e) { console.error("Boot step failed:", fn.name || "(anonymous)", e); } });
  window.addEventListener("hashchange", handleDeepLink);
});
/* ============================================================
   One-page KPI cheat sheet (hub feature)
   ============================================================ */
function printKpiCheatSheet() {
  const rows = KPI_CATS.filter(c => c !== "All").map(cat => {
    const items = KPIS.filter(k => k.cat === cat).map(k => `
      <div class="cs-item"><div class="cs-name">${esc(k.name)} <span class="cs-tier">${k.prio}</span></div>
        <div class="cs-formula">${esc(k.formula)}</div><div class="cs-def">${esc(k.plain)} · <b>Answer: ${esc(k.v25)}</b></div></div>`).join("");
    return `<h2>${cat}</h2><div class="cs-col">${items}</div>`;
  }).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>AXon Marketing Analytics — KPI Cheat Sheet</title>
  <style>@page { size: A4; margin: 10mm; } * { box-sizing: border-box; } body { font-family: Arial, Helvetica, sans-serif; color: #1A1D21; margin: 0; }
  .cs-header { text-align: center; margin-bottom: 10px; } .cs-header h1 { font-size: 16px; margin: 0 0 2px; } .cs-header p { font-size: 10px; color: #666; margin: 0; }
  .cs-wrap { column-count: 2; column-gap: 18px; } h2 { font-size: 12px; text-transform: uppercase; border-bottom: 1.5px solid #333; padding-bottom: 3px; margin: 10px 0 6px; break-after: avoid; }
  .cs-item { break-inside: avoid; margin-bottom: 6px; padding-bottom: 6px; border-bottom: 1px dotted #ccc; } .cs-name { font-size: 10.5px; font-weight: 700; }
  .cs-tier { font-size: 8px; background: #E6F3FA; color: #0A5A87; padding: 1px 4px; border-radius: 3px; } .cs-formula { font-family: 'Courier New', monospace; font-size: 9px; color: #0E6E9E; margin: 1px 0; }
  .cs-def { font-size: 9px; color: #444; line-height: 1.3; }</style></head><body>
  <div class="cs-header"><h1>AXon Marketing Analytics — KPI Cheat Sheet (${KPIS.length} measures)</h1><p>by Mahendra Singh · Data Analyst Trainer, ExcelR · unique (not total) opens · rates weighted by Sessions · revenue = Delivered orders</p></div>
  <div class="cs-wrap">${rows}</div></body></html>`;
  const win = window.open("", "_blank");
  if (!win) { chatToastMini("Please allow pop-ups to print the cheat sheet."); return; }
  win.document.open(); win.document.write(html); win.document.close(); win.focus();
  setTimeout(() => win.print(), 300);
}
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("print-cheatsheet-btn");
  if (btn) btn.addEventListener("click", printKpiCheatSheet);
});
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("img.zoomable").forEach(img => img.addEventListener("click", () => openModal(`<img class="zoom-img" src="${img.src}" alt="${esc(img.alt)}">`)));
});
/* ============================================================
   Live SQL Practice Editor (in-browser SQLite via sql.js) +
   "Today's 3 problems" daily challenge (DailySQL-style).
   ============================================================ */
const PRACTICE_PROBLEMS = [
  // ---------------- Easy ----------------
  { id: "e1", topic: "Aggregations", level: "Easy", mins: 3, t: "Campaigns per channel", task: "How many campaigns does each channel have? Return channel and n, biggest first.", tables: ["campaigns"], hint: "GROUP BY channel, COUNT(*).",
    sol: "SELECT channel, COUNT(*) AS n\nFROM campaigns\nGROUP BY channel\nORDER BY n DESC, channel;" },
  { id: "e2", topic: "Aggregations", level: "Easy", mins: 3, t: "Emails sent vs delivered", task: "Return total recipients (sent) and total delivered across all emails.", tables: ["email_performance"], hint: "SUM two columns.",
    sol: "SELECT SUM(recipients) AS sent, SUM(delivered) AS delivered\nFROM email_performance;" },
  { id: "e3", topic: "Aggregations", level: "Easy", mins: 4, t: "Email delivery rate", task: "Delivery rate % = delivered ÷ recipients × 100, rounded to 2 decimals.", tables: ["email_performance"], hint: "Multiply by 100.0 so SQLite doesn't do integer division.",
    sol: "SELECT ROUND(100.0 * SUM(delivered) / SUM(recipients), 2) AS delivery_rate\nFROM email_performance;" },
  { id: "e4", topic: "Aggregations", level: "Easy", mins: 4, t: "Unique vs total open rate", task: "Return total_open_rate (total_opens ÷ delivered) and unique_open_rate (unique_opens ÷ delivered), both % with 2 decimals.", tables: ["email_performance"], hint: "Two ROUND(100.0 * SUM(..) / SUM(delivered), 2) columns.",
    sol: "SELECT ROUND(100.0 * SUM(total_opens) / SUM(delivered), 2) AS total_open_rate,\n       ROUND(100.0 * SUM(unique_opens) / SUM(delivered), 2) AS unique_open_rate\nFROM email_performance;" },
  { id: "e5", topic: "Aggregations", level: "Easy", mins: 3, t: "Social spend by platform", task: "Total ad spend per platform, rounded to whole rupees, biggest first.", tables: ["social_ads_monthly"], hint: "ROUND(SUM(spend_inr)).",
    sol: "SELECT platform, ROUND(SUM(spend_inr)) AS spend\nFROM social_ads_monthly\nGROUP BY platform\nORDER BY spend DESC;" },
  { id: "e6", topic: "Aggregations", level: "Easy", mins: 3, t: "WhatsApp funnel totals", task: "Return total sent, delivered, read and clicked WhatsApp messages.", tables: ["whatsapp_summary"], hint: "SUM each column.",
    sol: "SELECT SUM(sent) AS sent, SUM(delivered) AS delivered, SUM(read) AS read_msgs, SUM(clicked) AS clicked\nFROM whatsapp_summary;" },
  { id: "e7", topic: "Aggregations", level: "Easy", mins: 3, t: "Sessions by traffic source", task: "Total sessions per traffic_source, biggest first.", tables: ["web_monthly"], hint: "SUM(sessions) — never COUNT rows.",
    sol: "SELECT traffic_source, SUM(sessions) AS sessions\nFROM web_monthly\nGROUP BY traffic_source\nORDER BY sessions DESC;" },
  { id: "e8", topic: "Sorting & Limits", level: "Easy", mins: 3, t: "Top 5 campaigns by spend", task: "Campaign name, channel and actual_spend_inr of the 5 biggest spenders.", tables: ["campaigns"], hint: "ORDER BY … DESC LIMIT 5.",
    sol: "SELECT campaign_name, channel, actual_spend_inr\nFROM campaigns\nORDER BY actual_spend_inr DESC\nLIMIT 5;" },
  // ---------------- Medium ----------------
  { id: "m1", topic: "Aggregations", level: "Medium", mins: 7, t: "Human open rate by campaign type", task: "For each campaign_type: human open rate % (human_unique_opens ÷ delivered, 1 decimal), highest first.", tables: ["email_performance"], hint: "GROUP BY campaign_type.",
    sol: "SELECT campaign_type, ROUND(100.0 * SUM(human_unique_opens) / SUM(delivered), 1) AS human_open_rate\nFROM email_performance\nGROUP BY campaign_type\nORDER BY human_open_rate DESC;" },
  { id: "m2", topic: "Aggregations", level: "Medium", mins: 8, t: "Facebook vs Instagram scorecard", task: "Per platform: CTR % (2 dp), CPC (2 dp), engagement rate % ((likes+comments+shares+saves) ÷ impressions, 2 dp) and ROAS (2 dp).", tables: ["social_ads_monthly"], hint: "Ratios of sums, not averages of ratios.",
    sol: "SELECT platform,\n       ROUND(100.0 * SUM(link_clicks) / SUM(impressions), 2) AS ctr,\n       ROUND(SUM(spend_inr) / SUM(link_clicks), 2) AS cpc,\n       ROUND(100.0 * (SUM(likes) + SUM(comments) + SUM(shares) + SUM(saves)) / SUM(impressions), 2) AS engagement_rate,\n       ROUND(SUM(purchase_value_inr) / SUM(spend_inr), 2) AS roas\nFROM social_ads_monthly\nGROUP BY platform\nORDER BY platform;" },
  { id: "m3", topic: "Joins", level: "Medium", mins: 8, t: "WhatsApp read & click rate by campaign", task: "Campaign name, read rate % and click rate % (both ÷ delivered, 1 dp), best click rate first.", tables: ["whatsapp_summary", "campaigns"], hint: "JOIN on campaign_id, then GROUP BY name.",
    sol: "SELECT c.campaign_name,\n       ROUND(100.0 * SUM(w.read) / SUM(w.delivered), 1) AS read_rate,\n       ROUND(100.0 * SUM(w.clicked) / SUM(w.delivered), 1) AS click_rate\nFROM whatsapp_summary w JOIN campaigns c ON c.campaign_id = w.campaign_id\nGROUP BY c.campaign_name\nORDER BY click_rate DESC, c.campaign_name;" },
  { id: "m4", topic: "Aggregations", level: "Medium", mins: 6, t: "Weighted bounce rate by device", task: "Per device_type: bounce rate % = bounced_sessions ÷ sessions (2 dp). Order by device_type.", tables: ["web_monthly"], hint: "SUM ÷ SUM, not AVG.",
    sol: "SELECT device_type, ROUND(100.0 * SUM(bounced_sessions) / SUM(sessions), 2) AS bounce_rate\nFROM web_monthly\nGROUP BY device_type\nORDER BY device_type;" },
  { id: "m5", topic: "Joins", level: "Medium", mins: 9, t: "Email ROI by campaign type", task: "For Email campaigns: campaign_type, spend, revenue (from campaign_revenue, 0 if none) and ROI % (0 dp), best first.", tables: ["campaigns", "campaign_revenue"], hint: "LEFT JOIN so campaigns with no orders still count; COALESCE revenue.",
    sol: "SELECT c.campaign_type,\n       SUM(c.actual_spend_inr) AS spend,\n       SUM(COALESCE(r.attributed_revenue_inr, 0)) AS revenue,\n       ROUND(100.0 * (SUM(COALESCE(r.attributed_revenue_inr, 0)) - SUM(c.actual_spend_inr)) / SUM(c.actual_spend_inr)) AS roi_pct\nFROM campaigns c LEFT JOIN campaign_revenue r ON r.campaign_id = c.campaign_id\nWHERE c.channel = 'Email'\nGROUP BY c.campaign_type\nORDER BY roi_pct DESC;" },
  { id: "m6", topic: "Aggregations", level: "Medium", mins: 6, t: "Engagement rate by ad format", task: "Per ad_format: engagement rate % (2 dp), highest first.", tables: ["social_ads_monthly"], hint: "(likes+comments+shares+saves) ÷ impressions.",
    sol: "SELECT ad_format,\n       ROUND(100.0 * (SUM(likes) + SUM(comments) + SUM(shares) + SUM(saves)) / SUM(impressions), 2) AS engagement_rate\nFROM social_ads_monthly\nGROUP BY ad_format\nORDER BY engagement_rate DESC;" },
  { id: "m7", topic: "Window Functions", level: "Medium", mins: 7, t: "Traffic share with a window function", task: "traffic_source, sessions and share % of all sessions (1 dp) using SUM() OVER ().", tables: ["web_monthly"], hint: "SUM(SUM(sessions)) OVER ().",
    sol: "SELECT traffic_source, SUM(sessions) AS sessions,\n       ROUND(100.0 * SUM(sessions) / SUM(SUM(sessions)) OVER (), 1) AS share_pct\nFROM web_monthly\nGROUP BY traffic_source\nORDER BY sessions DESC;" },
  { id: "m8", topic: "Window Functions", level: "Medium", mins: 9, t: "Month-over-month sessions (2024)", task: "For each 2024 month: sessions and % change vs the previous month (1 dp; NULL for January).", tables: ["web_monthly"], hint: "LAG(sessions) OVER (ORDER BY year_month) on a monthly subquery.",
    sol: "WITH m AS (\n  SELECT year_month, SUM(sessions) AS sessions FROM web_monthly\n  WHERE year_month LIKE '2024-%' GROUP BY year_month\n)\nSELECT year_month, sessions,\n       ROUND(100.0 * (sessions - LAG(sessions) OVER (ORDER BY year_month)) / LAG(sessions) OVER (ORDER BY year_month), 1) AS mom_pct\nFROM m ORDER BY year_month;" },
  // ---------------- Advanced ----------------
  { id: "a1", topic: "Window Functions", level: "Advanced", mins: 12, t: "Top 3 social campaigns per platform", task: "Rank social campaigns by ROAS within each platform; return platform, campaign_name, roas (2 dp) and rank for the top 3 of each.", tables: ["social_ads_monthly", "campaigns"], hint: "RANK() OVER (PARTITION BY platform ORDER BY roas DESC) in a CTE.",
    sol: "WITH r AS (\n  SELECT s.platform, c.campaign_name,\n         ROUND(SUM(s.purchase_value_inr) / SUM(s.spend_inr), 2) AS roas\n  FROM social_ads_monthly s JOIN campaigns c ON c.campaign_id = s.campaign_id\n  GROUP BY s.platform, c.campaign_name\n), k AS (\n  SELECT *, RANK() OVER (PARTITION BY platform ORDER BY roas DESC) AS rnk FROM r\n)\nSELECT platform, campaign_name, roas, rnk FROM k WHERE rnk <= 3\nORDER BY platform, rnk;" },
  { id: "a2", topic: "CTEs & Unions", level: "Advanced", mins: 14, t: "Channel comparison in one query", task: "One row per channel (Email, WhatsApp, Facebook, Instagram): spend, revenue and ROAS (2 dp). Email/WhatsApp revenue from campaign_revenue, Facebook/Instagram from social_ads_monthly.", tables: ["campaigns", "campaign_revenue", "social_ads_monthly"], hint: "Spend per channel from campaigns; revenue from a UNION ALL of the two sources.",
    sol: "WITH spend AS (\n  SELECT channel, SUM(actual_spend_inr) AS spend FROM campaigns GROUP BY channel\n), rev AS (\n  SELECT channel, SUM(attributed_revenue_inr) AS revenue FROM campaign_revenue GROUP BY channel\n  UNION ALL\n  SELECT platform, SUM(purchase_value_inr) FROM social_ads_monthly GROUP BY platform\n)\nSELECT s.channel, s.spend, r.revenue, ROUND(1.0 * r.revenue / s.spend, 2) AS roas\nFROM spend s JOIN rev r ON r.channel = s.channel\nORDER BY roas DESC;" },
  { id: "a3", topic: "Window Functions", level: "Advanced", mins: 10, t: "Running total of 2024 social spend", task: "For each 2024 month: monthly social spend (0 dp) and cumulative spend (0 dp).", tables: ["social_ads_monthly"], hint: "SUM(spend) OVER (ORDER BY year_month).",
    sol: "WITH m AS (\n  SELECT year_month, SUM(spend_inr) AS spend FROM social_ads_monthly\n  WHERE year_month LIKE '2024-%' GROUP BY year_month\n)\nSELECT year_month, ROUND(spend) AS spend,\n       ROUND(SUM(spend) OVER (ORDER BY year_month)) AS cumulative_spend\nFROM m ORDER BY year_month;" },
  { id: "a4", topic: "Joins", level: "Advanced", mins: 10, t: "Loss-making campaigns by channel", task: "For Email and WhatsApp: how many campaigns have negative ROI (revenue < spend, revenue 0 when no orders)?", tables: ["campaigns", "campaign_revenue"], hint: "LEFT JOIN + COALESCE, then SUM(CASE WHEN …).",
    sol: "SELECT c.channel,\n       SUM(CASE WHEN COALESCE(r.attributed_revenue_inr, 0) < c.actual_spend_inr THEN 1 ELSE 0 END) AS negative_roi,\n       COUNT(*) AS campaigns\nFROM campaigns c LEFT JOIN campaign_revenue r ON r.campaign_id = c.campaign_id\nWHERE c.channel IN ('Email', 'WhatsApp')\nGROUP BY c.channel ORDER BY c.channel;" },
  { id: "a5", topic: "Aggregations", level: "Advanced", mins: 8, t: "Gross margin by category", task: "Delivered orders only: product_category, revenue (0 dp), gross_profit (0 dp) and margin % (1 dp), best margin first.", tables: ["orders_monthly"], hint: "Profit = net revenue − product cost.",
    sol: "SELECT product_category,\n       ROUND(SUM(net_revenue_inr)) AS revenue,\n       ROUND(SUM(net_revenue_inr - product_cost_inr)) AS gross_profit,\n       ROUND(100.0 * SUM(net_revenue_inr - product_cost_inr) / SUM(net_revenue_inr), 1) AS margin_pct\nFROM orders_monthly WHERE order_status = 'Delivered'\nGROUP BY product_category ORDER BY margin_pct DESC;" },
  { id: "a6", topic: "Conditional Logic", level: "Advanced", mins: 10, t: "YoY sessions growth by source", task: "Per traffic_source: 2023 sessions, 2024 sessions and growth % (1 dp), fastest growth first.", tables: ["web_monthly"], hint: "Conditional aggregation: SUM(CASE WHEN year_month LIKE '2024%' THEN sessions END).",
    sol: "SELECT traffic_source,\n       SUM(CASE WHEN year_month LIKE '2023%' THEN sessions END) AS s2023,\n       SUM(CASE WHEN year_month LIKE '2024%' THEN sessions END) AS s2024,\n       ROUND(100.0 * (SUM(CASE WHEN year_month LIKE '2024%' THEN sessions END) - SUM(CASE WHEN year_month LIKE '2023%' THEN sessions END))\n             / SUM(CASE WHEN year_month LIKE '2023%' THEN sessions END), 1) AS growth_pct\nFROM web_monthly GROUP BY traffic_source ORDER BY growth_pct DESC;" },
  { id: "a7", topic: "Aggregations", level: "Advanced", mins: 9, t: "Ad profit by platform and year", task: "platform, year (first 4 chars of year_month), ad profit (margin − spend, 0 dp) and profit % of purchase value (1 dp).", tables: ["social_ads_monthly"], hint: "SUBSTR(year_month, 1, 4).",
    sol: "SELECT platform, SUBSTR(year_month, 1, 4) AS year,\n       ROUND(SUM(purchase_gross_margin_inr) - SUM(spend_inr)) AS ad_profit,\n       ROUND(100.0 * (SUM(purchase_gross_margin_inr) - SUM(spend_inr)) / SUM(purchase_value_inr), 1) AS profit_pct\nFROM social_ads_monthly GROUP BY platform, year ORDER BY platform, year;" },
  { id: "a8", topic: "Subqueries", level: "Advanced", mins: 11, t: "Campaign types beating the overall CTOR", task: "campaign_type and CTOR % (unique_clicks ÷ unique_opens, 1 dp) for types whose CTOR is above the overall CTOR. Highest first.", tables: ["email_performance"], hint: "Compare with a scalar subquery in HAVING.",
    sol: "SELECT campaign_type, ROUND(100.0 * SUM(unique_clicks) / SUM(unique_opens), 1) AS ctor\nFROM email_performance\nGROUP BY campaign_type\nHAVING 1.0 * SUM(unique_clicks) / SUM(unique_opens) >\n       (SELECT 1.0 * SUM(unique_clicks) / SUM(unique_opens) FROM email_performance)\nORDER BY ctor DESC;" },
];
const ED_KEY = "axon_mkt_editor_v1";
let edDb = null, edLoading = null, edCur = null, psLevel = "All", psTopic = "All", psTable = "All";
function edState() { try { const s = JSON.parse(lsGet(ED_KEY)); return s && s.solved ? s : { solved: {}, drafts: {} }; } catch (e) { return { solved: {}, drafts: {} }; } }
function edSave(s) { lsSet(ED_KEY, JSON.stringify(s)); }
const localDay = (d) => { const x = d || new Date(); return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
function todaysProblems() {
  const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
  const pick = (lv, k) => { const L = PRACTICE_PROBLEMS.filter(p => p.level === lv); return L[(day * k) % L.length]; };
  return [pick("Easy", 1), pick("Medium", 3), pick("Advanced", 5)];
}
function solveDays() { const st = edState(); return new Set(Object.values(st.solved)); }
function solveStreak() {
  const set = solveDays(); let n = 0; const d = new Date();
  if (!set.has(localDay(d))) d.setDate(d.getDate() - 1);           // streak survives until today ends
  while (set.has(localDay(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function loadSqlEngine() {
  if (edDb) return Promise.resolve(edDb);
  if (edLoading) return edLoading;
  edLoading = new Promise((res, rej) => {
    const go = () => window.initSqlJs({}).then(SQL => {
      const db = new SQL.Database(); const T = window.PRACTICE_DB || {};
      db.run("BEGIN");
      Object.entries(T).forEach(([name, t]) => {
        const types = t.cols.map((c, i) => { const vals = t.rows.map(r => r[i]).filter(v => v !== null); if (!vals.length || typeof vals[0] !== "number") return "TEXT"; return vals.every(Number.isInteger) && !/inr|rate|pct/.test(c) ? "INTEGER" : "REAL"; });
        db.run(`CREATE TABLE ${name} (${t.cols.map((c, i) => `"${c}" ${types[i]}`).join(", ")})`);
        const st = db.prepare(`INSERT INTO ${name} VALUES (${t.cols.map(() => "?").join(",")})`);
        t.rows.forEach(r => st.run(r)); st.free();
      });
      db.run("COMMIT"); edDb = db; res(db);
    }).catch(rej);
    if (window.initSqlJs) go();
    else { const s = document.createElement("script"); s.src = "assets/vendor/sql-asm.js"; s.onload = go; s.onerror = () => rej(new Error("Could not load the SQL engine")); document.head.appendChild(s); }
  });
  return edLoading;
}
function edRun(sql) { const res = edDb.exec(sql); return res.length ? res[res.length - 1] : { columns: [], values: [] }; }
function edNorm(r, ordered) {
  const rows = r.values.map(row => row.map(v => v === null ? "∅" : (typeof v === "number" ? (Math.round(v * 100) / 100).toFixed(2) : String(v).trim())).join("¦"));
  return ordered ? rows : rows.slice().sort();
}
function edTable(r) {
  if (!r.columns.length) return `<div class="ed-empty">Query ran. No rows returned.</div>`;
  const head = `<tr>${r.columns.map(c => `<th>${esc(c)}</th>`).join("")}</tr>`;
  const body = r.values.slice(0, 200).map(row => `<tr>${row.map(v => `<td>${v === null ? '<span class="ed-null">NULL</span>' : esc(typeof v === "number" ? (Number.isInteger(v) ? v.toLocaleString("en-IN") : (Math.round(v * 100) / 100).toLocaleString("en-IN")) : v)}</td>`).join("")}</tr>`).join("");
  return `<div class="ed-rowcount">${r.values.length} row${r.values.length === 1 ? "" : "s"}${r.values.length > 200 ? " (showing 200)" : ""}</div><div class="ed-table-wrap"><table class="dtable ed-table"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}
const lvlBadge = (l) => `<span class="lvl lvl-${l.toLowerCase()}">${l === "Medium" ? "Med." : l === "Advanced" ? "Hard" : l}</span>`;

/* ---------------- Problemset (browse) ---------------- */
function renderProblemset() {
  const rowsEl = document.getElementById("ps-rows"); if (!rowsEl) return;
  const st = edState(); const solvedN = Object.keys(st.solved).length; const today = todaysProblems();
  document.getElementById("ps-progress").textContent = `${solvedN} / ${PRACTICE_PROBLEMS.length} Solved`;
  document.getElementById("ps-streak").textContent = `${solveStreak()} day streak · ${today.filter(p => st.solved[p.id]).length}/3 of today's set`;
  document.getElementById("ps-today-sub").textContent = today.map(p => p.t).join(" · ");
  const topics = ["All", ...new Set(PRACTICE_PROBLEMS.map(p => p.topic))];
  document.getElementById("ps-topics").innerHTML = topics.map(t => `<button class="ps-chip ${t === psTopic ? "on" : ""}" data-topic="${esc(t)}">${t === "All" ? "All Topics" : esc(t)} <small>(${t === "All" ? PRACTICE_PROBLEMS.length : PRACTICE_PROBLEMS.filter(p => p.topic === t).length})</small></button>`).join("");
  const tabs = ["All", "email_performance", "social_ads_monthly", "whatsapp_summary", "web_monthly", "orders_monthly", "campaigns"];
  const tlabel = { All: "All Tables", email_performance: "Email", social_ads_monthly: "Facebook & Instagram", whatsapp_summary: "WhatsApp", web_monthly: "Web", orders_monthly: "Orders", campaigns: "Campaigns" };
  document.getElementById("ps-tables").innerHTML = tabs.map(t => `<button class="ps-disc ${t === psTable ? "on" : ""}" data-tab="${t}">${tlabel[t]}</button>`).join("");
  document.getElementById("ps-levels").innerHTML = ["All", "Easy", "Medium", "Advanced"].map(l => `<button class="${l === psLevel ? "on" : ""}" data-lv="${l}">${l === "Advanced" ? "Hard" : l}</button>`).join("");
  const q = (document.getElementById("ps-search").value || "").toLowerCase(); const stf = document.getElementById("ps-status").value;
  const list = PRACTICE_PROBLEMS.map((p, i) => ({ ...p, n: i + 1 })).filter(p => (psLevel === "All" || p.level === psLevel) && (psTopic === "All" || p.topic === psTopic) && (psTable === "All" || p.tables.includes(psTable))
    && (!q || (p.n + " " + p.t + " " + p.task).toLowerCase().includes(q)) && (stf === "all" || (stf === "done") === !!st.solved[p.id]));
  rowsEl.innerHTML = list.length ? list.map(p => `<tr data-open="${p.id}">
      <td>${st.solved[p.id] ? '<span class="ps-st done">✓</span>' : '<span class="ps-st"></span>'}</td>
      <td><div class="ps-title">${p.n}. ${esc(p.t)}${today.some(x => x.id === p.id) ? ' <span class="ps-todaytag">TODAY</span>' : ""}</div><div class="ps-tags"><span class="ps-tag2">▤ SQL</span>${p.tables.map(t => `<span class="ps-tag2 grey">${t}</span>`).join("")}</div></td>
      <td class="ps-time">${p.mins} min</td><td>${lvlBadge(p.level)}</td><td class="ps-arrow">→</td></tr>`).join("")
    : `<tr><td colspan="5" class="ed-empty">No problems match these filters.</td></tr>`;
  rowsEl.querySelectorAll("[data-open]").forEach(r => r.addEventListener("click", () => openProblem(r.dataset.open)));
  document.querySelectorAll("#ps-topics [data-topic]").forEach(b => b.addEventListener("click", () => { psTopic = b.dataset.topic; renderProblemset(); }));
  document.querySelectorAll("#ps-tables [data-tab]").forEach(b => b.addEventListener("click", () => { psTable = b.dataset.tab; renderProblemset(); }));
  document.querySelectorAll("#ps-levels [data-lv]").forEach(b => b.addEventListener("click", () => { psLevel = b.dataset.lv; renderProblemset(); }));
  renderCalendar();
  const tl = document.getElementById("ps-tablelist");
  if (tl) tl.innerHTML = Object.entries(window.PRACTICE_DB || {}).map(([n, t]) => `<div class="ps-tl"><code>${n}</code><span>${t.rows.length} rows · ${t.cols.length} cols</span></div>`).join("");
}
function renderCalendar() {
  const w = document.getElementById("ps-cal"); if (!w) return;
  const days = solveDays(); const now = new Date(); const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate(); const todayN = now.getDate();
  let cells = ""; for (let i = 0; i < first; i++) cells += "<span></span>";
  for (let d = 1; d <= n; d++) { const key = localDay(new Date(y, m, d)); cells += `<span class="${d === todayN ? "today" : ""} ${days.has(key) ? "solved" : ""}">${d}</span>`; }
  let last7 = 0; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (days.has(localDay(d))) last7++; }
  const solvedToday = days.has(localDay());
  w.innerHTML = `<div class="ps-cal-head"><span class="ps-fire">🔥</span><div><strong>${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" }).toUpperCase()}</strong><small>${days.size} days solved · ${solveStreak()} day streak</small></div><span class="ps-badge ${solvedToday ? "ok" : ""}">${solvedToday ? "Done today" : "Not yet today"}</span></div>
    <div class="ps-cal-grid">${["S", "M", "T", "W", "T", "F", "S"].map(x => `<b>${x}</b>`).join("")}${cells}</div>
    <div class="ps-cal-foot"><span>Last 7 days</span><strong>${last7} / 7 Days</strong></div><div class="ps-cal-bar"><i style="width:${Math.round(last7 / 7 * 100)}%"></i></div>`;
}

/* ---------------- Solve view ---------------- */
function renderSchema() {
  const w = document.getElementById("ed-schema"); if (!w) return;
  const T = window.PRACTICE_DB || {};
  w.innerHTML = Object.entries(T).map(([n, t]) => `<details ${edCur && edCur.tables.includes(n) ? "open" : ""}><summary><code>${n}</code> <span>${t.rows.length} rows</span></summary><div class="ed-cols">${t.cols.map(c => `<button class="ed-col" data-ins="${c}">${c}</button>`).join("")}</div></details>`).join("");
  w.querySelectorAll("[data-ins]").forEach(b => b.addEventListener("click", () => { const ta = document.getElementById("ed-sql"); const p = ta.selectionStart; ta.value = ta.value.slice(0, p) + b.dataset.ins + ta.value.slice(ta.selectionEnd); ta.focus(); ta.selectionStart = ta.selectionEnd = p + b.dataset.ins.length; }));
}
function showBrowse() { const b = document.getElementById("ed-browse"), s = document.getElementById("ed-solve"); if (!b) return; b.style.display = ""; s.style.display = "none"; renderProblemset(); }
function openProblem(id) {
  initEditor();
  edCur = PRACTICE_PROBLEMS.find(p => p.id === id) || PRACTICE_PROBLEMS[0];
  document.getElementById("ed-browse").style.display = "none"; document.getElementById("ed-solve").style.display = "";
  const st = edState(); const idx = PRACTICE_PROBLEMS.indexOf(edCur);
  document.getElementById("ed-pos").textContent = `Problem ${idx + 1} of ${PRACTICE_PROBLEMS.length} · ${edCur.topic}`;
  document.getElementById("ed-title").innerHTML = `${lvlBadge(edCur.level)} ${idx + 1}. ${esc(edCur.t)} <span class="ed-mins">⏱ ${edCur.mins} min</span>${st.solved[edCur.id] ? ' <span class="ps-badge ok">Solved</span>' : ""}`;
  document.getElementById("ed-task").textContent = edCur.task;
  document.getElementById("ed-tables").innerHTML = "Tables: " + edCur.tables.map(t => `<code>${t}</code>`).join(" ");
  document.getElementById("ed-sql").value = st.drafts[edCur.id] || `-- ${edCur.t}\nSELECT *\nFROM ${edCur.tables[0]}\nLIMIT 10;`;
  document.getElementById("ed-out").innerHTML = `<div class="ed-empty">Write your query, then press <kbd>Run</kbd> (Ctrl + Enter) and <kbd>Submit</kbd>.</div>`;
  document.getElementById("ed-msg").innerHTML = "";
  renderSchema(); window.scrollTo({ top: 0, behavior: "auto" });
}
function edMsg(kind, html) { document.getElementById("ed-msg").innerHTML = `<div class="ed-msg ${kind}">${html}</div>`; }
function initEditor() {
  const run = document.getElementById("ed-run"); if (!run) return;
  if (run._b) { if (document.getElementById("ed-solve").style.display === "none") renderProblemset(); return; }
  run._b = true;
  const ta = document.getElementById("ed-sql");
  const withDb = (fn) => { edMsg("info", "⏳ Loading the SQL engine (first time only)…"); loadSqlEngine().then(() => { document.getElementById("ed-msg").innerHTML = ""; fn(); }).catch(e => edMsg("bad", "⚠ " + esc(e.message) + ". Open the site from a web server (or check your connection)."));
  };
  const doRun = () => withDb(() => { const st = edState(); st.drafts[edCur.id] = ta.value; edSave(st);
    try { document.getElementById("ed-out").innerHTML = edTable(edRun(ta.value)); } catch (e) { edMsg("bad", "❌ " + esc(e.message)); } });
  run.addEventListener("click", doRun);
  ta.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); doRun(); }
    if (e.key === "Tab") { e.preventDefault(); const p = ta.selectionStart; ta.value = ta.value.slice(0, p) + "  " + ta.value.slice(ta.selectionEnd); ta.selectionStart = ta.selectionEnd = p + 2; }
  });
  document.getElementById("ed-check").addEventListener("click", () => withDb(() => {
    let mine;
    try { mine = edRun(ta.value); } catch (e) { edMsg("bad", "❌ Your query has an error: " + esc(e.message)); return; }
    const exp = edRun(edCur.sol); document.getElementById("ed-out").innerHTML = edTable(mine);
    const ordered = /order\s+by[^()]*;?\s*$/i.test(edCur.sol);
    const ok = mine.columns.length === exp.columns.length && JSON.stringify(edNorm(mine, ordered)) === JSON.stringify(edNorm(exp, ordered));
    if (ok) { const st = edState(); if (!st.solved[edCur.id]) st.solved[edCur.id] = localDay(); st.drafts[edCur.id] = ta.value; edSave(st);
      const t3 = todaysProblems(); const done = t3.filter(p => st.solved[p.id]).length;
      edMsg("good", `✅ Correct · ${done} of 3 today · 🔥 ${solveStreak()} day streak`); renderHeroCards(); }
    else edMsg("bad", `✗ Not quite. Expected ${exp.values.length} row(s) × ${exp.columns.length} column(s); you returned ${mine.values.length} × ${mine.columns.length}. ${mine.columns.length === exp.columns.length ? "Check your values, rounding and filters." : "Check the columns you SELECT."}`);
  }));
  document.getElementById("ed-hint").addEventListener("click", () => edMsg("info", "💡 " + esc(edCur.hint)));
  document.getElementById("ed-solution").addEventListener("click", () => { ta.value = edCur.sol; edMsg("info", "🔓 Solution loaded. Run it and compare with your approach."); });
  document.getElementById("ed-reset").addEventListener("click", () => { const st = edState(); delete st.drafts[edCur.id]; edSave(st); openProblem(edCur.id); });
  document.getElementById("ed-back").addEventListener("click", showBrowse);
  const step = (k) => { const i = PRACTICE_PROBLEMS.indexOf(edCur); openProblem(PRACTICE_PROBLEMS[(i + k + PRACTICE_PROBLEMS.length) % PRACTICE_PROBLEMS.length].id); };
  document.getElementById("ed-prev").addEventListener("click", () => step(-1));
  document.getElementById("ed-next").addEventListener("click", () => step(1));
  document.getElementById("ps-search").addEventListener("input", renderProblemset);
  document.getElementById("ps-status").addEventListener("change", renderProblemset);
  document.getElementById("ps-random").addEventListener("click", () => { const st = edState(); const L = PRACTICE_PROBLEMS.filter(p => !st.solved[p.id]); const pool = L.length ? L : PRACTICE_PROBLEMS; openProblem(pool[Math.floor(Math.random() * pool.length)].id); });
  document.getElementById("ps-today-go").addEventListener("click", () => { const st = edState(); const t = todaysProblems(); openProblem((t.find(p => !st.solved[p.id]) || t[0]).id); });
  renderProblemset();
}

/* ---------------- Hero floating cards (DailySQL-style) ---------------- */
function renderHeroCards() {
  const st = edState(); const t3 = todaysProblems(); const done = t3.filter(p => st.solved[p.id]).length; const streak = solveStreak();
  const c3 = document.getElementById("hero-top-card");
  if (c3) {
    const ch = (MD.ch_roas || []).slice(0, 4); const col = { Email: "#8B5CF6", WhatsApp: "#16A34A", Facebook: "#2563EB", Instagram: "#DB2777" };
    c3.innerHTML = `<div class="hf-top"><span>🏆</span><span class="hf-lv dark">Top channels by ROAS</span></div>${ch.map(([k, v]) => `<div class="hf-lb"><i style="background:${col[k] || "#0EA5A4"}">${k[0]}</i><span>${k}</span><b>${v}×</b></div>`).join("")}<div class="hf-foot">From the AXon dataset</div>`;
  }
}
function renderDailyCard() { renderHeroCards(); }
function renderIntegrity() {
  const t = document.getElementById("integrity-table"); const R = (window.MKT && window.MKT.integrity) || []; if (!t || !R.length) return;
  const ok = R.filter(r => r.ok).length;
  t.innerHTML = `<thead><tr><th>Check</th><th>Relationship / rule</th><th>Result</th><th>Status</th></tr></thead><tbody>${R.map(r => `<tr><td>${esc(r.check)}</td><td><code>${esc(r.relationship)}</code></td><td class="num">${fmtN(r.result)}${r.note ? `<div style="font-size:11.5px;color:var(--ink-muted);">${esc(r.note)}</div>` : ""}</td><td>${r.ok ? '<span class="recon-ok">✓ Pass</span>' : '<span style="color:var(--red);font-weight:700;">✗ Fail</span>'}</td></tr>`).join("")}</tbody><tfoot><tr><td colspan="4"><strong>${ok} / ${R.length} checks pass.</strong></td></tr></tfoot>`;
}
document.addEventListener("DOMContentLoaded", () => {
  renderHeroCards(); renderIntegrity();
  document.querySelectorAll("[data-scroll]").forEach(b => b.addEventListener("click", () => { const t = document.getElementById(b.dataset.scroll); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); }));
  document.querySelectorAll('.ds-announce [data-goto="editor"]').forEach(b => b.addEventListener("click", () => switchView("editor")));
});
/* ============================================================
   Project Schedule & Group Presentation Status
   - Students: read-only view of the schedule published by the trainer
     (project-schedule.js, or a trainer's share link).
   - Trainer: PIN unlock → edit project code, kick-off date, presentation
     day, groups and statuses → "Publish" downloads project-schedule.js
     to upload with the site. Students can't change what others see:
     only the uploaded file (or the trainer's link) is shown to everyone.
   ============================================================ */
const SCH_STAGES = [
  { key: "kickoff", t: "Project Kick-off", d: "Problem statement, KPI document and dataset walkthrough; groups formed.", week: 0, track: false },
  { key: "excel", t: "Excel Dashboard Presentation", d: "KPIs in Excel and the Excel dashboard.", week: 1, track: true },
  { key: "tableau", t: "Tableau Dashboard Presentation", d: "Tableau connected to MySQL. SQL QA can be presented this week or next.", week: 2, track: true, sqlqa: true },
  { key: "powerbi", t: "Power BI Dashboard Presentation", d: "Power BI connected to MySQL. Last chance to present SQL QA.", week: 3, track: true, sqlqa: true },
  { key: "final", t: "Final Presentation", d: "8 sections: Group Details → Summary → KPI List → Excel → Tableau → Power BI → SQL Query Image → Key Takeaway.", week: 4, track: true },
];
const SCH_COLS = [["excel", "Excel"], ["tableau", "Tableau"], ["powerbi", "Power BI"], ["sqlqa", "SQL QA"], ["final", "Final"]];
const SCH_ST = { done: ["✅", "Done", "st-done"], pending: ["⏳", "Pending", "st-pending"], absent: ["❌", "Nobody presented", "st-absent"] };
const SCH_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SCH_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SCH_DRAFT = "axon_mkt_schedule_draft_v1", SCH_UNLOCK = "axon_mkt_schedule_unlocked", SCH_VIEW = "axon_mkt_schedule_view";
let schEditCode = null;
/* Live sync. schedule-config.js: "auto" = use this site's own /api/schedule (Vercel + Upstash Redis) when it is
   connected, otherwise fall back to project-schedule.js. A full URL (e.g. a Google Apps Script web app) also works. */
const SCH_CFG = String(window.PROJECT_SCHEDULE_API || "").trim();
const SCH_AUTO = SCH_CFG.toLowerCase() === "auto";
let SCH_API = SCH_AUTO ? "" : SCH_CFG;
const SCH_PIN = "axon_mkt_schedule_pin";
let schRemote = null, schSyncMsg = "", schSaveTimer = null, schLoaded = !SCH_API;
/* "auto": probe /api/schedule once; switch to live mode only if the server answers with a configured database. */
function schProbe() {
  if (!SCH_AUTO || !/^https?:$/.test(location.protocol)) return;
  fetch("api/schedule?t=" + Date.now(), { cache: "no-store" }).then(r => r.ok ? r.json() : null).then(j => {
    if (!j || j.configured === false || !Array.isArray(j.projects)) return;   // not set up → keep file mode
    SCH_API = "api/schedule";
    if (schIsTrainer()) { try { sessionStorage.removeItem(SCH_UNLOCK); } catch (e) {} }  // re-login against the server PIN
    schRemote = j.projects.length ? j : null; schLoaded = true;
    renderSchedule(); renderHeroSchedule();
    setInterval(() => { if (!schIsTrainer()) schLoadRemote(true); }, 60000);
  }).catch(() => {});
}
function schApi(payload) {
  return fetch(SCH_API, { method: "POST", body: JSON.stringify(payload) }).then(r => r.json());
}
function schLoadRemote(silent) {
  if (!SCH_API) return Promise.resolve();
  return fetch(SCH_API + (SCH_API.includes("?") ? "&" : "?") + "t=" + Date.now()).then(r => r.json()).then(j => {
    if (schIsTrainer() && schSaveTimer) return;                 // don't overwrite unsaved trainer edits
    schRemote = j && j.projects && j.projects.length ? j : null; schLoaded = true;
    renderSchedule(); renderHeroSchedule();
  }).catch(() => { schLoaded = true; if (!silent) { schSyncMsg = "⚠ Could not load the live schedule. Showing the last published file."; renderSchedule(); } });
}
function schPushRemote(d) {
  schRemote = d; schSyncMsg = "⏳ Saving…"; schShowSync();
  clearTimeout(schSaveTimer);
  schSaveTimer = setTimeout(() => {
    let pin = ""; try { pin = sessionStorage.getItem(SCH_PIN) || ""; } catch (e) {}
    schApi({ action: "save", pin, data: d }).then(j => {
      schSaveTimer = null;
      schSyncMsg = j.ok ? `✅ Saved ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} · students see it now (on refresh)` : "⚠ Not saved: " + (j.error || "error");
      schShowSync();
    }).catch(() => { schSaveTimer = null; schSyncMsg = "⚠ Not saved: no internet or server not ready. Try again."; schShowSync(); });
  }, 700);
}
function schShowSync() { const e = document.getElementById("sch-sync"); if (e) e.textContent = schSyncMsg; }

/* ---------- tiny SHA-256 (works on file:// too) ---------- */
function sha256(str) {
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const bytes = Array.from(new TextEncoder().encode(str)); const l = bytes.length * 8;
  bytes.push(0x80); while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (l >>> (i * 8)) & 255);
  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const r = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < bytes.length; o += 64) {
    const w = [];
    for (let i = 0; i < 16; i++) w[i] = (bytes[o + 4 * i] << 24) | (bytes[o + 4 * i + 1] << 16) | (bytes[o + 4 * i + 2] << 8) | bytes[o + 4 * i + 3];
    for (let i = 16; i < 64; i++) { const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H = H.map((v, i) => (v + [a, b, c, d, e, f, g, h][i]) | 0);
  }
  return H.map(v => (v >>> 0).toString(16).padStart(8, "0")).join("");
}
const schHash = (pin) => sha256("axon-mkt-trainer|" + pin);

/* ---------- data ---------- */
const schClone = (o) => JSON.parse(JSON.stringify(o));
function schPublished() { return schClone(window.PROJECT_SCHEDULE || { pinHash: schHash("excelr2026"), active: "", projects: [] }); }
function schFromHash() {
  const m = location.hash.match(/schedule=([A-Za-z0-9_\-]+)/); if (!m) return null;
  try { return JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g, "+").replace(/_/g, "/"))))); } catch (e) { return null; }
}
function schIsTrainerX() { try { return sessionStorage.getItem(SCH_UNLOCK) === "1"; } catch (e) { return false; } }
function schIsTrainer() { return schIsTrainerX(); }
function schDraft() { try { const d = JSON.parse(lsGet(SCH_DRAFT)); return d && d.projects ? d : null; } catch (e) { return null; } }
function schData() {
  if (SCH_API) {
    if (schIsTrainer()) { if (!schRemote) schRemote = schPublished(); return schRemote; }
    const base = schRemote ? schClone(schRemote) : schPublished(); const h = schFromHash();
    if (h && h.code) { base.projects = base.projects.filter(x => x.code !== h.code).concat([h]); base.active = h.code; }
    return base;
  }
  if (schIsTrainer()) return schDraft() || schPublished();
  const pub = schPublished(); const h = schFromHash();
  if (h && h.code) { pub.projects = pub.projects.filter(p => p.code !== h.code).concat([h]); pub.active = h.code; }
  return pub;
}
function schSaveDraft(d) { d.updated = new Date().toISOString(); if (SCH_API) { schPushRemote(d); return; } lsSet(SCH_DRAFT, JSON.stringify(d)); }
function schCurrent(d) {
  let code = schIsTrainer() ? schEditCode : null;
  if (!code) { try { code = lsGet(SCH_VIEW); } catch (e) {} }
  const h = schFromHash(); if (!schIsTrainer() && h && h.code) code = h.code;
  return d.projects.find(p => p.code === code) || d.projects.find(p => p.code === d.active) || d.projects[0] || null;
}
const ymd = (dt) => `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
const parseYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
function schStageDates(p) {
  const k = parseYmd(p.kickoff); const out = { kickoff: p.kickoff };
  let first = new Date(k); first.setDate(first.getDate() + 6);
  while (first.getDay() !== Number(p.presDay)) first.setDate(first.getDate() + 1);
  SCH_STAGES.filter(s => s.week > 0).forEach(s => { const d = new Date(first); d.setDate(d.getDate() + 7 * (s.week - 1)); out[s.key] = (p.overrides && p.overrides[s.key]) || ymd(d); });
  if (p.overrides && p.overrides.kickoff) out.kickoff = p.overrides.kickoff;
  return out;
}
const fmtD = (s) => { const d = parseYmd(s); return `${SCH_DAYS[d.getDay()].slice(0, 3)}, ${d.getDate()} ${SCH_MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
function schPhase(dateStr, nextStr) {
  const today = parseYmd(ymd(new Date())), d = parseYmd(dateStr);
  if (+d === +today) return ["today", "Today"];
  if (d < today) return ["past", "Completed"];
  const prevWeek = new Date(d); prevWeek.setDate(prevWeek.getDate() - 7);
  return today > prevWeek ? ["next", "This week"] : ["future", "Upcoming"];
}
function schNext(p) {
  const ds = schStageDates(p); const today = ymd(new Date());
  return SCH_STAGES.find(s => ds[s.key] >= today) || null;
}
function schGroupStatus(p, g, key) { const s = (p.status && p.status[g.id]) || {}; return s[key] || "pending"; }
function schCounts(p, key) { const c = { done: 0, pending: 0, absent: 0 }; (p.groups || []).forEach(g => c[schGroupStatus(p, g, key)]++); return c; }
function schNewProject(code) {
  const today = new Date(); const fri = new Date(today); while (fri.getDay() !== 5) fri.setDate(fri.getDate() - 1);
  const groups = Array.from({ length: 6 }, (_, i) => ({ id: "g" + (i + 1), name: "Group " + (i + 1), members: "" }));
  return { code, name: "Marketing Analytics Capstone", kickoff: ymd(fri), presDay: 6, time: "9:00 PM – 10:00 PM", overrides: {}, groups, status: {} };
}

/* ---------- rendering ---------- */
const stChip = (s, extra) => `<span class="st-chip ${SCH_ST[s][2]}">${SCH_ST[s][0]} ${SCH_ST[s][1]}${extra || ""}</span>`;
function renderSchedule() {
  const root = document.getElementById("sch-root"); if (!root) return;
  const d = schData(); const p = schCurrent(d); const tr = schIsTrainer();
  document.getElementById("sch-mode").innerHTML = tr
    ? `<span class="sch-badge tr">🔓 Trainer mode</span><button class="btn-outline" id="sch-lock">Lock</button>`
    : `<span class="sch-badge">👀 Student view (read-only)</span><button class="sch-trainer-link" id="sch-unlock">Trainer login</button>`;
  const picker = d.projects.length > 1 || tr ? `<label class="sch-pick">Project code <select id="sch-select">${d.projects.map(x => `<option value="${esc(x.code)}" ${p && x.code === p.code ? "selected" : ""}>${esc(x.code)}</option>`).join("")}</select></label>` : "";
  if (!p) { root.innerHTML = `${picker}<div class="card sch-empty">No project has been published yet. ${tr ? "Create one below." : "Ask your trainer for the project link."}</div>` + (tr ? schAdminHtml(d, null) : ""); schBind(d, null); return; }
  const ds = schStageDates(p); const nx = schNext(p);
  const timeline = SCH_STAGES.map((s, i) => {
    const [ph, pl] = schPhase(ds[s.key]);
    const c = s.track ? schCounts(p, s.key) : null;
    const qa = s.sqlqa ? schCounts(p, "sqlqa") : null;
    return `<div class="sch-stage ${ph}"><div class="sch-dot">${ph === "past" ? "✓" : i}</div><div class="sch-body">
      <div class="sch-when">${fmtD(ds[s.key])} · ${esc(p.time || "")} <span class="sch-ph ${ph}">${pl}</span></div>
      <h4>${s.week ? "Week " + s.week + " · " : ""}${esc(s.t)}</h4><p>${esc(s.d)}</p>
      ${c ? `<div class="sch-counts">${stChip("done", ` ${c.done}`)}${stChip("pending", ` ${c.pending}`)}${c.absent ? stChip("absent", ` ${c.absent}`) : ""}</div>` : ""}
      ${s.sqlqa ? `<div class="sch-qa">+ SQL QA (either week): ${qa.done} of ${(p.groups || []).length} groups done</div>` : ""}
    </div></div>`;
  }).join("");
  const rows = (p.groups || []).map(g => {
    const st = (p.status && p.status[g.id]) || {};
    return `<tr><td><strong>${esc(g.name)}</strong>${g.members ? `<div class="sch-mem">${esc(g.members)}</div>` : ""}</td>${SCH_COLS.map(([k]) => `<td>${stChip(schGroupStatus(p, g, k), k === "sqlqa" && st.sqlqaWeek ? ` · ${st.sqlqaWeek === "tableau" ? "Tableau wk" : "Power BI wk"}` : "")}</td>`).join("")}<td class="sch-note">${esc(st.note || "")}</td></tr>`;
  }).join("");
  root.innerHTML = `${picker}
    <div class="sch-head card"><div><div class="sch-code">${esc(p.code)}</div><h3>${esc(p.name || "Marketing Analytics Capstone")}</h3>
      <p>Kick-off ${fmtD(ds.kickoff)} · weekly presentations every <strong>${SCH_DAYS[p.presDay]}</strong> · ${esc(p.time || "")} · ${(p.groups || []).length} groups</p></div>
      ${nx ? `<div class="sch-next"><span>Next</span><strong>${esc(nx.t)}</strong><em>${fmtD(ds[nx.key])}</em></div>` : `<div class="sch-next done"><span>Status</span><strong>Project completed 🎉</strong></div>`}</div>
    <div class="sch-timeline">${timeline}</div>
    <div class="section-head mt-40" style="margin-bottom:12px;"><div class="eyebrow">Group status</div><h2>Who has presented what</h2><p>✅ Done · ⏳ Pending · ❌ Nobody from the group presented in the meeting. SQL QA can be presented in the Tableau week or the Power BI week.</p></div>
    <div class="card table-scroll"><table class="dtable sch-table"><thead><tr><th>Group</th>${SCH_COLS.map(([, l]) => `<th>${l}</th>`).join("")}<th>Trainer note</th></tr></thead><tbody>${rows || `<tr><td colspan="7">No groups yet.</td></tr>`}</tbody></table></div>
    <p class="sch-upd">Last updated by trainer: ${p.updated ? new Date(p.updated).toLocaleString("en-IN") : "—"}</p>
    ${tr ? schAdminHtml(d, p) : ""}`;
  schBind(d, p);
}
function schAdminHtml(d, p) {
  if (!p) return `<div class="card sch-admin"><h3>Create a project</h3><div class="sch-row"><input class="search-input" id="sch-newcode" placeholder="Project code, e.g. MKT-OCT26-B1"><button class="btn-blue" id="sch-create">Create project</button></div></div>`;
  const k = parseYmd(p.kickoff); const yrs = []; for (let y = new Date().getFullYear() - 1; y <= new Date().getFullYear() + 1; y++) yrs.push(y);
  const dim = new Date(k.getFullYear(), k.getMonth() + 1, 0).getDate();
  const ds = schStageDates(p);
  const sel = (id, opts, v) => `<select id="${id}">${opts.map(([val, lab]) => `<option value="${val}" ${String(val) === String(v) ? "selected" : ""}>${lab}</option>`).join("")}</select>`;
  const stSel = (gid, key, v) => `<select data-st="${gid}|${key}" class="st-sel ${SCH_ST[v][2]}">${Object.entries(SCH_ST).map(([s, [i, l]]) => `<option value="${s}" ${s === v ? "selected" : ""}>${i} ${l}</option>`).join("")}</select>`;
  const groups = (p.groups || []).map(g => { const st = (p.status && p.status[g.id]) || {};
    return `<tr><td><input data-gname="${g.id}" value="${esc(g.name)}"><input data-gmem="${g.id}" value="${esc(g.members || "")}" placeholder="Members (optional)"></td>
      ${SCH_COLS.map(([key]) => `<td>${stSel(g.id, key, st[key] || "pending")}${key === "sqlqa" ? sel("", [["", "Week?"], ["tableau", "Tableau wk"], ["powerbi", "Power BI wk"]], st.sqlqaWeek || "").replace('<select id=""', `<select data-qaw="${g.id}"`) : ""}</td>`).join("")}
      <td><input data-gnote="${g.id}" value="${esc(st.note || "")}" placeholder="Note"></td><td><button class="sch-del" data-gdel="${g.id}" title="Remove group">✕</button></td></tr>`; }).join("");
  return `<div class="card sch-admin">
    <div class="sch-admin-head"><h3>🔓 Trainer controls</h3>${SCH_API ? `<span class="sch-live">☁ Live sync ON: every change saves automatically and students see it.</span>` : `<span>Changes save on this device. Students see them only after you <strong>Publish</strong> (or set up Live sync).</span>`}</div>
    ${SCH_API ? `<div class="sch-sync" id="sch-sync">${esc(schSyncMsg || "☁ Connected")}</div>` : ""}
    <div class="sch-grid">
      <label>Project code<input class="search-input" id="sch-code" value="${esc(p.code)}"></label>
      <label>Project name<input class="search-input" id="sch-name" value="${esc(p.name || "")}"></label>
      <label>Kick-off: year ${sel("sch-y", yrs.map(y => [y, y]), k.getFullYear())}</label>
      <label>Month ${sel("sch-m", SCH_MONTHS.map((m, i) => [i, m]), k.getMonth())}</label>
      <label>Day ${sel("sch-d", Array.from({ length: dim }, (_, i) => [i + 1, `${i + 1} · ${SCH_DAYS[new Date(k.getFullYear(), k.getMonth(), i + 1).getDay()].slice(0, 3)}`]), k.getDate())}</label>
      <label>Presentation day ${sel("sch-pd", SCH_DAYS.map((x, i) => [i, x]), p.presDay)}</label>
      <label>Meeting time<input class="search-input" id="sch-time" value="${esc(p.time || "")}"></label>
    </div>
    <details class="sch-over"><summary>Change a single presentation date (holiday, reschedule)</summary><div class="sch-grid">${SCH_STAGES.filter(s => s.week > 0).map(s => `<label>${s.t}<input type="date" data-over="${s.key}" value="${ds[s.key]}"></label>`).join("")}<button class="btn-outline" id="sch-clearover">Reset to weekly dates</button></div></details>
    <h4 style="margin:16px 0 8px;">Groups & presentation status</h4>
    <div class="table-scroll"><table class="dtable sch-edit"><thead><tr><th>Group</th>${SCH_COLS.map(([, l]) => `<th>${l}</th>`).join("")}<th>Note</th><th></th></tr></thead><tbody>${groups}</tbody></table></div>
    <div class="sch-row"><button class="btn-outline" id="sch-addg">+ Add group</button><button class="btn-outline" id="sch-reset">↺ Reset all statuses</button><button class="btn-outline" id="sch-newp">+ New project</button><button class="btn-outline" id="sch-delp">🗑 Delete project</button><button class="btn-outline" id="sch-pin">Change PIN</button>${SCH_API ? `<button class="btn-outline" id="sch-reload">⟳ Reload from server</button>` : `<button class="btn-outline" id="sch-discard">Load live file (discard draft)</button>`}</div>
    <div class="sch-publish" ${SCH_API ? 'style="display:none"' : ""}>
      <div><strong>Publish to students</strong><p>1) Download <code>project-schedule.js</code> → 2) replace that file in the site folder (GitHub / Vercel / hosting) → students see the update. Or share a link right now (works for the selected project).</p></div>
      <div class="sch-row"><button class="btn-blue" id="sch-download">⬇ Download project-schedule.js</button><button class="btn-dark" id="sch-link">🔗 Copy student link</button></div>
    </div></div>`;
}
function schBind(d, p) {
  const $ = (id) => document.getElementById(id);
  const save = () => { if (p) p.updated = new Date().toISOString(); schSaveDraft(d); renderSchedule(); renderHeroSchedule(); };
  const selEl = $("sch-select");
  if (selEl) selEl.addEventListener("change", () => { if (schIsTrainer()) schEditCode = selEl.value; else lsSet(SCH_VIEW, selEl.value); if (schIsTrainer()) { d.active = selEl.value; schSaveDraft(d); } renderSchedule(); renderHeroSchedule(); });
  const un = $("sch-unlock");
  if (un) un.addEventListener("click", () => {
    const pin = prompt("Trainer PIN"); if (pin === null) return;
    if (SCH_API) {
      schApi({ action: "check", pin }).then(j => {
        if (!j.ok) { alert(j.error || "Wrong PIN."); return; }
        try { sessionStorage.setItem(SCH_UNLOCK, "1"); sessionStorage.setItem(SCH_PIN, pin); } catch (e) {}
        if (!schRemote) { schRemote = schDraft() || schPublished(); schSaveDraft(schRemote); }   // first live login: carry over the details already filled on this device
        schSyncMsg = "☁ Connected · changes save automatically"; renderSchedule();
      }).catch(() => alert("Could not reach the live sync server. Check your internet and try again."));
      return;
    }
    if (schHash(pin) === schPublished().pinHash || (schDraft() && schHash(pin) === schDraft().pinHash)) { try { sessionStorage.setItem(SCH_UNLOCK, "1"); } catch (e) {} if (!schDraft()) schSaveDraft(schPublished()); renderSchedule(); }
    else alert("Wrong PIN.");
  });
  const lk = $("sch-lock"); if (lk) lk.addEventListener("click", () => { try { sessionStorage.removeItem(SCH_UNLOCK); sessionStorage.removeItem(SCH_PIN); } catch (e) {} schEditCode = null; renderSchedule(); renderHeroSchedule(); });
  if (!schIsTrainer()) return;
  const cr = $("sch-create"); if (cr) cr.addEventListener("click", () => { const c = ($("sch-newcode").value || "").trim(); if (!c) return; d.projects.push(schNewProject(c)); d.active = c; schEditCode = c; save(); });
  if (!p) return;
  const on = (id, ev, fn) => { const e = $(id); if (e) e.addEventListener(ev, fn); };
  on("sch-code", "change", (e) => { const v = e.target.value.trim(); if (!v || d.projects.some(x => x !== p && x.code === v)) { alert("Code must be unique."); renderSchedule(); return; } if (d.active === p.code) d.active = v; p.code = v; schEditCode = v; save(); });
  on("sch-name", "change", (e) => { p.name = e.target.value; save(); });
  const setK = () => { const y = +$("sch-y").value, m = +$("sch-m").value; const dim = new Date(y, m + 1, 0).getDate(); const dd = Math.min(+$("sch-d").value, dim); p.kickoff = ymd(new Date(y, m, dd)); save(); };
  ["sch-y", "sch-m", "sch-d"].forEach(id => on(id, "change", setK));
  on("sch-pd", "change", (e) => { p.presDay = +e.target.value; save(); });
  on("sch-time", "change", (e) => { p.time = e.target.value; save(); });
  document.querySelectorAll("[data-over]").forEach(i => i.addEventListener("change", () => { p.overrides = p.overrides || {}; p.overrides[i.dataset.over] = i.value; save(); }));
  on("sch-clearover", "click", () => { p.overrides = {}; save(); });
  const gst = (gid) => { p.status = p.status || {}; p.status[gid] = p.status[gid] || {}; return p.status[gid]; };
  document.querySelectorAll("[data-st]").forEach(s => s.addEventListener("change", () => { const [gid, key] = s.dataset.st.split("|"); gst(gid)[key] = s.value; save(); }));
  document.querySelectorAll("[data-qaw]").forEach(s => s.addEventListener("change", () => { gst(s.dataset.qaw).sqlqaWeek = s.value; save(); }));
  document.querySelectorAll("[data-gnote]").forEach(s => s.addEventListener("change", () => { gst(s.dataset.gnote).note = s.value; save(); }));
  document.querySelectorAll("[data-gname]").forEach(s => s.addEventListener("change", () => { p.groups.find(g => g.id === s.dataset.gname).name = s.value; save(); }));
  document.querySelectorAll("[data-gmem]").forEach(s => s.addEventListener("change", () => { p.groups.find(g => g.id === s.dataset.gmem).members = s.value; save(); }));
  document.querySelectorAll("[data-gdel]").forEach(b => b.addEventListener("click", () => { if (!confirm("Remove this group?")) return; p.groups = p.groups.filter(g => g.id !== b.dataset.gdel); if (p.status) delete p.status[b.dataset.gdel]; save(); }));
  on("sch-addg", "click", () => { const n = (p.groups || []).length + 1; let id = "g" + n; while (p.groups.some(g => g.id === id)) id += "x"; p.groups.push({ id, name: "Group " + n, members: "" }); save(); });
  on("sch-reset", "click", () => { if (confirm("Reset every group's status to Pending for " + p.code + "?")) { p.status = {}; save(); } });
  on("sch-newp", "click", () => { const c = (prompt("New project code (e.g. MKT-NOV26-B2)") || "").trim(); if (!c) return; if (d.projects.some(x => x.code === c)) { alert("That code already exists."); return; } d.projects.push(schNewProject(c)); schEditCode = c; d.active = c; save(); });
  on("sch-delp", "click", () => { if (!confirm("Delete project " + p.code + "?")) return; d.projects = d.projects.filter(x => x !== p); schEditCode = null; d.active = d.projects[0] ? d.projects[0].code : ""; save(); });
  on("sch-pin", "click", () => { const a = prompt("New trainer PIN (min 4 characters)"); if (!a || a.length < 4) return; if (prompt("Type the new PIN again") !== a) { alert("PINs don't match."); return; }
    if (SCH_API) { let pin = ""; try { pin = sessionStorage.getItem(SCH_PIN) || ""; } catch (e) {} schApi({ action: "setpin", pin, newPin: a }).then(j => { if (j.ok) { try { sessionStorage.setItem(SCH_PIN, a); } catch (e) {} alert("PIN changed on the server. Use the new PIN from now on."); } else alert(j.error || "Could not change PIN."); }).catch(() => alert("Could not reach the server.")); return; } d.pinHash = schHash(a); save(); alert("PIN changed. Download and upload project-schedule.js so the new PIN applies on the live site."); });
  on("sch-reload", "click", () => { schRemote = null; schLoadRemote(); });
  on("sch-discard", "click", () => { if (!confirm("Discard your unpublished changes on this device and load the live project-schedule.js?")) return; lsSet(SCH_DRAFT, JSON.stringify(schPublished())); schEditCode = null; renderSchedule(); renderHeroSchedule(); });
  on("sch-download", "click", () => {
    d.active = p.code; const out = schClone(d); out.updated = new Date().toISOString();
    const js = "/* Project schedule & group status. Edit it from the site (Trainer login), then replace this file. */\nwindow.PROJECT_SCHEDULE = " + JSON.stringify(out, null, 1) + ";\n";
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([js], { type: "text/javascript" })); a.download = "project-schedule.js"; document.body.appendChild(a); a.click(); a.remove();
  });
  on("sch-link", "click", (e) => {
    const one = schClone(p); one.updated = new Date().toISOString();
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(one)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const url = location.href.split("#")[0] + "#schedule=" + b64;
    copyText(url, e.target, "🔗 Copy student link");
  });
}
/* ---------- hero cards (home) ---------- */
function renderHeroSchedule() {
  const d = schData(); const p = schCurrent(d);
  const c1 = document.getElementById("hero-problem-card"), c2 = document.getElementById("hero-streak-card"), c4 = document.getElementById("hero-today-card");
  if (!p) { [c1, c2, c4].forEach(c => { if (c) c.innerHTML = `<div class="hf-lv dark">PROJECT SCHEDULE</div><p style="margin-top:6px;">Your trainer will publish the schedule here.</p>`; }); return; }
  const ds = schStageDates(p); const nx = schNext(p);
  if (c1) {
    c1.innerHTML = nx ? `<div class="hf-top"><span class="hf-ic">📅</span><span class="hf-lv">${esc(p.code)}</span><span class="hf-day">${schPhase(ds[nx.key])[1]}</span></div><h5>Next: ${esc(nx.t)}</h5><p>${esc(nx.d)}</p>
      <div class="hf-when">${fmtD(ds[nx.key])}<br><small>${esc(p.time || "")}</small></div>` : `<div class="hf-top"><span class="hf-ic">🎉</span><span class="hf-lv">${esc(p.code)}</span></div><h5>Project completed</h5><p>All presentations are done.</p>`;
    c1.onclick = () => switchView("schedule");
  }
  if (c2) {
    const stg = nx && nx.track ? nx : SCH_STAGES.filter(s => s.track).reverse().find(s => ds[s.key] <= ymd(new Date())) || SCH_STAGES[1];
    const c = schCounts(p, stg.key); const n = (p.groups || []).length || 1;
    c2.innerHTML = `<div class="hf-top"><span>👥</span><span class="hf-lv dark">GROUP STATUS</span><span class="hf-fire">${esc(stg.t.split(" ")[0])}</span></div>
      <div class="hf-big">${c.done}<small>of ${n} groups done</small></div><div class="hf-bar"><i style="width:${Math.round(c.done / n * 100)}%"></i></div>
      ${(p.groups || []).slice(0, 4).map(g => { const s = schGroupStatus(p, g, stg.key); return `<div class="hf-row"><span>${esc(g.name)}</span><span class="${s === "done" ? "ok" : ""}">${SCH_ST[s][0]}</span></div>`; }).join("")}
      ${(p.groups || []).length > 4 ? `<div class="hf-foot">+${p.groups.length - 4} more groups</div>` : ""}`;
    c2.onclick = () => switchView("schedule"); c2.style.cursor = "pointer";
  }
  if (c4) {
    c4.innerHTML = `<div class="hf-lv dark" style="margin-bottom:8px;">PROJECT TIMELINE · ${esc(p.code)}</div>${SCH_STAGES.map(s => { const [ph] = schPhase(ds[s.key]); return `<div class="hf-li ${ph}"><span>${ph === "past" ? "✓" : ph === "next" || ph === "today" ? "●" : "○"}</span><span>${esc(s.t.replace(" Presentation", ""))}</span><small>${fmtD(ds[s.key]).replace(/, \d{4}$/, "")}</small></div>`; }).join("")}<div class="hf-foot"><i class="dot"></i> Weekly every ${SCH_DAYS[p.presDay]}</div>`;
    c4.onclick = () => switchView("schedule"); c4.style.cursor = "pointer";
  }
}
document.addEventListener("DOMContentLoaded", () => {
  renderSchedule(); renderHeroSchedule();
  if (schFromHash()) setTimeout(() => switchView("schedule"), 50);
  if (SCH_API) { schLoadRemote(); setInterval(() => { if (!schIsTrainer()) schLoadRemote(true); }, 60000); }
  else schProbe();
});
/* ============================================================
   Job Simulator: Incident Room, Broken Dashboard, Stakeholder Simulator
   + cloud progress hook (window.HUB_PROGRESS, used by visit-kit.js)
   Every number below is an existing AXon answer-key value (mkt-data.js).
   ============================================================ */
const SIM_KEY = "axon_mkt_sim_v1";
function simState() { try { const s = JSON.parse(lsGet(SIM_KEY)); if (s && typeof s === "object") return Object.assign({ inc: {}, brk: {}, stk: {} }, s); } catch (e) {} return { inc: {}, brk: {}, stk: {} }; }
function simSave(s) { lsSet(SIM_KEY, JSON.stringify(s)); try { window.dispatchEvent(new Event("hub-progress")); } catch (e) {} }
const simPct = (n) => `${Math.round(n)}%`;
const N_ = (n) => Number(n).toLocaleString("en-IN");
const WA_ = (A.wa || {});

/* ============================================================
   1) INCIDENT ROOM
   ============================================================ */
const INCIDENTS = [
  { id: "i1", lvl: "Easy", title: "“Our open rate is 69%!”", from: "Priya Menon · CMO", time: "Mon 9:12 AM",
    msg: `Our email open rate is ${A.total_open_rate}%. Industry average is around 20%. I want this number on the board deck on Friday. Can you confirm it?`,
    metric: [["Open rate on the dashboard", `${A.total_open_rate}%`]],
    evidence: [
      { id: "e1", rel: true, t: "Total vs unique opens", sql: "SELECT COUNT(*) AS total_opens,\n       COUNT(DISTINCT CONCAT(Email_ID, '-', Customer_ID)) AS unique_opens\nFROM Activities WHERE Activity_Type = 'Open';",
        res: [["total_opens", N_(A.opens)], ["unique_opens", N_(A.unique_opens)], ["delivered", N_(A.delivered)]], note: `${N_(A.opens)} ÷ ${N_(A.delivered)} = ${A.total_open_rate}%, but ${N_(A.unique_opens)} ÷ ${N_(A.delivered)} = ${A.unique_open_rate}%. The same person opening twice was counted twice.` },
      { id: "e2", rel: true, t: "Open rate by email client", sql: "-- unique open rate by Customers.Email_Client", res: (MD.open_by_client || []).map(([k, v]) => [k, v + "%"]), note: "Apple Mail is far above every other client. Gmail, Outlook and Other are all around 31%." },
      { id: "e3", rel: true, t: "Seconds between delivery and open", sql: "-- opens that happen < 15 seconds after the Delivered event", res: [["machine opens (< 15 s)", N_(A.machine_opens)], ["share of all opens", A.machine_open_share + "%"]], note: "Apple Mail Privacy Protection pre-loads every email, which fires the tracking pixel without a human opening it." },
      { id: "e4", rel: false, t: "Emails sent per month", sql: "SELECT DATE_FORMAT(Email_Sent_Date, '%Y-%m'), SUM(Recipients) FROM Emails GROUP BY 1;", res: [["pattern", "steady, no spike"]], note: "Send volume did not change. This doesn't explain the open rate." },
    ],
    causes: [["c1", "The tracking pixel is broken and fires twice"], ["c2", "Open rate counts every open (repeats) and Apple Mail machine opens, not unique human opens", true], ["c3", "Subject lines improved a lot this quarter"], ["c4", "Bounced emails were counted as delivered"], ["c5", "There are duplicate customers in the Customers table"]],
    fixes: [["f1", `Report unique human open rate (unique opens ≥ 15 s after delivery ÷ delivered) = ${A.human_open_rate}%, and show the raw number only as a footnote`, true], ["f2", "Remove Apple Mail users from the mailing list"], ["f3", "Use total opens ÷ emails sent"], ["f4", "Stop reporting open rate at all"]],
    answer: `Root cause: open rate was total opens ÷ delivered, so repeat opens and Apple Mail's automatic “machine opens” (${N_(A.machine_opens)}) were counted. Unique open rate is ${A.unique_open_rate}%; human open rate is <b>${A.human_open_rate}%</b>.`,
    tell: `“The 69% counts repeat and automatic opens. The real human open rate is ${A.human_open_rate}%, which is still well above the industry average. I'd put ${A.human_open_rate}% on the board deck.”` },
  { id: "i2", lvl: "Easy", title: "“WhatsApp only delivers 27.6%”", from: "Rohan Gupta · CRM Manager", time: "Tue 11:40 AM",
    msg: `The WhatsApp report says only ${WA_.wrong_delivery_rate}% of our messages are delivered. Should we cancel the WhatsApp BSP contract?`,
    metric: [["Delivery rate on the report", `${WA_.wrong_delivery_rate}%`]],
    evidence: [
      { id: "e1", rel: true, t: "Message_Status distribution", sql: "SELECT Message_Status, COUNT(*) FROM WhatsApp_Messages GROUP BY Message_Status;", res: [["Read", N_(WA_.read)], ["Delivered", N_(WA_.delivered_status_only)], ["Failed", N_(WA_.failed)], ["Total", N_(WA_.sent)]], note: "Only 3,303 messages failed. Most messages are in the Read status." },
      { id: "e2", rel: true, t: "Data dictionary: Message_Status", sql: "-- Data Dictionary → WhatsApp_Messages", res: [["Message_Status", "the FINAL status of the message"], ["lifecycle", "Sent → Delivered → Read"]], note: "A message marked Read was delivered first. Its status just moved on." },
      { id: "e3", rel: false, t: "Opt-outs", sql: "SELECT SUM(Opted_Out = 'Yes') FROM WhatsApp_Messages;", res: [["opted out", N_(WA_.optouts)], ["opt-out rate", WA_.optout_rate + "%"]], note: "Opt-outs are low and don't explain delivery." },
      { id: "e4", rel: false, t: "Time to read", sql: "-- median minutes from send to read", res: [["median", (WA_.read_median_min || 66) + " min"]], note: "Interesting for timing, not for delivery." },
    ],
    causes: [["c1", "The BSP is failing to deliver most messages"], ["c2", "Many phone numbers are invalid"], ["c3", "Delivered was counted only where Message_Status = 'Delivered', so messages that went on to be Read were left out", true], ["c4", "Customers opted out of WhatsApp"], ["c5", "Messages were sent twice"]],
    fixes: [["f1", `Delivered = Message_Status IN ('Delivered', 'Read') → ${WA_.delivery_rate}%, and document that the column is the final status`, true], ["f2", "Switch to a different BSP"], ["f3", "Count only messages with status 'Sent'"], ["f4", "Exclude Read messages from the denominator"]],
    answer: `Root cause: Message_Status stores the final status. Read messages were delivered first, so Delivered = Delivered + Read = ${N_(WA_.delivered)} of ${N_(WA_.sent)} → <b>${WA_.delivery_rate}%</b>.`,
    tell: `“Delivery is actually ${WA_.delivery_rate}%, not ${WA_.wrong_delivery_rate}%. The report counted only messages still sitting in 'Delivered' and missed the ${N_(WA_.read)} that were read. No need to change the BSP.”` },
  { id: "i3", lvl: "Medium", title: "“Website traffic was zero on 12 March”", from: "Kavya Iyer · Head of Digital", time: "Wed 4:05 PM",
    msg: `The dashboard shows zero website sessions on 12 March 2024, but Meta still spent ₹${N_(A.spend_gap_missing_day)} that day. Did the site crash, and are we wasting ad money?`,
    metric: [["Sessions on 12 Mar 2024", "0"], ["Meta spend that day", `₹${N_(A.spend_gap_missing_day)}`]],
    evidence: [
      { id: "e1", rel: true, t: "Daily sessions, 8–16 March 2024", sql: "SELECT Date, SUM(Sessions) FROM Web_Engagement\nWHERE Date BETWEEN '2024-03-08' AND '2024-03-16' GROUP BY Date;", res: [["8 Mar", "20,181"], ["9 Mar", "22,706"], ["10 Mar", "24,842"], ["11 Mar", "21,234"], ["12 Mar", "(no row)"], ["13 Mar", "21,339"], ["14 Mar", "21,150"]], note: "12 March isn't a low number. It has no row at all." },
      { id: "e2", rel: true, t: "Rows per day in Web_Engagement", sql: "SELECT Date, COUNT(*) FROM Web_Engagement GROUP BY Date ORDER BY 2;", res: [["normal day", "96 rows (8 sources × 3 devices × 4 regions)"], ["12 Mar 2024", "0 rows"]], note: "Every other day of 730 has exactly 96 rows." },
      { id: "e3", rel: true, t: "Orders on the same days", sql: "SELECT DATE(Order_Date), COUNT(*) FROM Orders\nWHERE Order_Date BETWEEN '2024-03-10' AND '2024-03-14' GROUP BY 1;", res: [["10 Mar", "61"], ["11 Mar", "65"], ["12 Mar", "50"], ["13 Mar", "76"], ["14 Mar", "61"]], note: "People were still buying on 12 March. The site was up." },
      { id: "e4", rel: false, t: "Festive season flag", sql: "SELECT Festive_Season FROM Dim_Date WHERE Date = '2024-03-12';", res: [["Festive_Season", "No"]], note: "Not a holiday. Doesn't explain a total blank." },
    ],
    causes: [["c1", "The website crashed for the whole day"], ["c2", "Meta ads were paused"], ["c3", "Web analytics tracking failed that day, so the data is missing (no rows), not zero traffic", true], ["c4", "A bot filter removed all sessions"], ["c5", "It was a public holiday"]],
    fixes: [["f1", "Add a completeness check (96 rows expected per day), flag the missing day on the dashboard, and exclude it from daily averages instead of treating it as 0", true], ["f2", "Fill 12 March with zeros"], ["f3", "Stop Meta ads on days with no traffic"], ["f4", "Delete 12 March from Dim_Date"]],
    answer: `Root cause: a tracking outage. Web_Engagement has <b>no rows</b> for 2024-03-12 while every other day has 96, and orders (50) and Meta spend (₹${N_(A.spend_gap_missing_day)}) continued normally.`,
    tell: "“The site didn't crash. Web tracking failed for that one day, so we have no data, not zero visitors. Orders came in as usual. I've flagged the day and excluded it from averages.”" },
  { id: "i4", lvl: "Advanced", title: "“Email revenue jumped 4×”", from: "Arjun Nair · Finance Controller", time: "Thu 6:30 PM",
    msg: `Your new SQL view says email marketing drove ₹1,63,78,333. Last month's report said ₹${N_(A.attr_rev)}. Which number goes to the CFO?`,
    metric: [["New view", "₹1,63,78,333"], ["Last report", `₹${N_(A.attr_rev)}`]],
    evidence: [
      { id: "e1", rel: true, t: "Row counts before and after the join", sql: "SELECT COUNT(*) FROM Orders WHERE Attributed_Channel='Email' AND Order_Status='Delivered';\nSELECT COUNT(*) FROM vw_email_revenue;   -- the new view", res: [["delivered email orders", "2,113"], ["rows in the new view", "8,712"]], note: "The view has 4× more rows than there are orders." },
      { id: "e2", rel: true, t: "The new view's SQL", sql: "SELECT SUM(o.Net_Revenue_INR)\nFROM Orders o\nJOIN Activities a\n  ON a.Email_ID = o.Attributed_Email_ID\n AND a.Customer_ID = o.Customer_ID\nWHERE o.Order_Status = 'Delivered';", res: [["joins to", "every email event of that customer"]], note: "Activities has one row per event: Delivered, Open, Click…" },
      { id: "e3", rel: true, t: "Activity types inside the join", sql: "SELECT a.Activity_Type, COUNT(*) FROM ... GROUP BY 1;", res: [["Open", "3,722"], ["Click", "2,872"], ["Delivered", "2,113"], ["Unsubscribe", "4"], ["Spam Complaint", "1"]], note: "Each order is repeated once per event." },
      { id: "e4", rel: false, t: "Email campaign spend", sql: "SELECT SUM(Actual_Spend_INR) FROM Campaigns WHERE Channel = 'Email';", res: [["spend", `₹${N_(A.spend)}`]], note: "Spend didn't change, only the revenue query did." },
    ],
    causes: [["c1", "Email campaigns really performed 4× better"], ["c2", "Cancelled and returned orders were included"], ["c3", "Join fan-out: Orders joined to Activities repeats each order's revenue once per email event", true], ["c4", "Currency was converted twice"], ["c5", "Orders has duplicate Order_IDs"]],
    fixes: [["f1", "Sum revenue at order grain first (or join only one deduplicated row per order), and add a QA check: row count before the join = row count after", true], ["f2", "Divide the result by 4"], ["f3", "Use SUM(DISTINCT Net_Revenue_INR)"], ["f4", "Remove the Activities table from the model"]],
    answer: `Root cause: join fan-out. 2,113 orders became 8,712 rows (one per Open/Click/Delivered event), so revenue was summed ~4×. The correct figure is <b>₹${N_(A.attr_rev)}</b>.`,
    tell: `“Use ₹${N_(A.attr_rev)}. The new view joined orders to every email event and counted each order several times. I've fixed the query and added a row-count check so it can't happen silently again.”` },
];
let incCur = null, incOpened = new Set();
function incBest(id) { const s = simState(); return s.inc[id] ? s.inc[id].best : null; }
function renderIncidentRoom() {
  const root = document.getElementById("inc-root"); if (!root) return;
  if (!incCur) {
    root.innerHTML = `<div class="js-grid">${INCIDENTS.map((x, i) => { const b = incBest(x.id); return `<button class="card js-case" data-inc="${x.id}">
        <div class="js-case-top"><span class="lvl lvl-${x.lvl.toLowerCase()}">${x.lvl}</span><span class="js-case-n">Incident ${i + 1}</span>${b != null ? `<span class="js-best ${b >= 70 ? "ok" : ""}">Best ${b}%</span>` : ""}</div>
        <h4>🚨 ${x.title}</h4><p>${esc(x.from)}</p><span class="js-open">${b != null ? "Retry" : "Investigate"} →</span></button>`; }).join("")}</div>`;
    root.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => { incCur = INCIDENTS.find(x => x.id === b.dataset.inc); incOpened = new Set(); renderIncidentRoom(); window.scrollTo({ top: 0 }); }));
    return;
  }
  const x = incCur;
  root.innerHTML = `<button class="btn-outline js-back" id="inc-back">← All incidents</button>
    <div class="card js-alert"><div class="js-alert-h"><span>🚨 DATA INCIDENT</span><small>${esc(x.time)}</small></div>
      <div class="js-msg"><b>${esc(x.from)}</b><p>${esc(x.msg)}</p></div>
      <div class="js-metrics">${x.metric.map(([k, v]) => `<div><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div></div>
    <h4 class="js-step">Step 1 · Collect evidence <small>(open what you need, not everything)</small></h4>
    <div class="js-ev">${x.evidence.map(e => `<div class="card js-evc ${incOpened.has(e.id) ? "open" : ""}" data-ev="${e.id}"><button class="js-evb">${incOpened.has(e.id) ? "▾" : "▸"} ${esc(e.t)}</button>
      ${incOpened.has(e.id) ? `<pre>${esc(e.sql)}</pre><table class="js-res">${e.res.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table><p class="js-note">${esc(e.note)}</p>` : ""}</div>`).join("")}</div>
    <h4 class="js-step">Step 2 · What is the root cause?</h4>
    <div class="js-opts">${x.causes.map(([id, t]) => `<label class="js-opt"><input type="radio" name="inc-c" value="${id}"> ${esc(t)}</label>`).join("")}</div>
    <h4 class="js-step">Step 3 · How do you fix it and stop it happening again?</h4>
    <div class="js-opts">${x.fixes.map(([id, t]) => `<label class="js-opt"><input type="radio" name="inc-f" value="${id}"> ${esc(t)}</label>`).join("")}</div>
    <h4 class="js-step">Step 4 · Your one-line reply to ${esc(x.from.split(" · ")[0])} <small>(not scored; compare with the model answer)</small></h4>
    <textarea class="js-reply" id="inc-reply" placeholder="Write it the way you would in Slack or email…"></textarea>
    <div class="js-actions"><button class="btn-blue" id="inc-submit">Submit investigation</button></div>
    <div id="inc-result"></div>`;
  root.querySelector("#inc-back").addEventListener("click", () => { incCur = null; renderIncidentRoom(); });
  root.querySelectorAll("[data-ev] .js-evb").forEach(b => b.addEventListener("click", () => { const id = b.parentNode.dataset.ev; if (incOpened.has(id)) incOpened.delete(id); else incOpened.add(id); const c = root.querySelector('input[name="inc-c"]:checked'), f = root.querySelector('input[name="inc-f"]:checked'), r = root.querySelector("#inc-reply").value; renderIncidentRoom(); if (c) root.querySelector(`input[name="inc-c"][value="${c.value}"]`).checked = true; if (f) root.querySelector(`input[name="inc-f"][value="${f.value}"]`).checked = true; root.querySelector("#inc-reply").value = r; }));
  root.querySelector("#inc-submit").addEventListener("click", () => {
    const c = root.querySelector('input[name="inc-c"]:checked'), f = root.querySelector('input[name="inc-f"]:checked');
    if (!c || !f) { root.querySelector("#inc-result").innerHTML = `<div class="ed-msg bad">Pick a root cause and a fix first.</div>`; return; }
    const relOpen = x.evidence.filter(e => e.rel && incOpened.has(e.id)).length, decoys = x.evidence.filter(e => !e.rel && incOpened.has(e.id)).length;
    const cOk = x.causes.find(o => o[0] === c.value)[2] === true, fOk = x.fixes.find(o => o[0] === f.value)[2] === true;
    const ev = Math.max(0, Math.min(20, relOpen * 8) - decoys * 2), sc = Math.round(ev + (cOk ? 50 : 0) + (fOk ? 30 : 0));
    const s = simState(); const prev = s.inc[x.id] || {}; s.inc[x.id] = { best: Math.max(prev.best || 0, sc), last: sc, tries: (prev.tries || 0) + 1, ts: Date.now() }; simSave(s);
    root.querySelector("#inc-result").innerHTML = `<div class="card js-score"><div class="js-score-h"><span>Investigation score</span><b>${sc}%</b></div>
      <div class="js-bars">${[["Evidence", ev, 20], ["Root cause", cOk ? 50 : 0, 50], ["Fix & prevention", fOk ? 30 : 0, 30]].map(([k, v, m]) => `<div class="js-bar"><span>${k}</span><i><em style="width:${v / m * 100}%"></em></i><b>${Math.round(v)}/${m}</b></div>`).join("")}</div>
      <p>${cOk ? "✅" : "❌"} ${x.answer}</p><p>${fOk ? "✅" : "❌"} <b>Fix:</b> ${esc(x.fixes.find(o => o[2])[1])}</p>
      <p class="js-note">${relOpen < 2 ? "Tip: an analyst confirms the cause with evidence before answering. Open the relevant evidence next time." : decoys ? `You opened ${decoys} evidence card(s) that didn't help. That's fine, but be quick to drop a lead that doesn't explain the number.` : "Good evidence trail: you went straight to what explains the number."}</p>
      <div class="js-tell"><b>Model reply to the stakeholder</b><p>${x.tell}</p></div></div>`;
    renderSimSummary();
  });
}

/* ============================================================
   2) BROKEN DASHBOARD
   ============================================================ */
const BROKEN_TILES = [
  { id: "t1", label: "Emails Delivered", val: N_(A.delivered), bad: false, why: "Correct: Delivered events = Recipients − Bounced." },
  { id: "t2", label: "Delivery Rate", val: A.doc_delivery + "%", bad: true, why: `Delivered ÷ number of emails (471) instead of ÷ recipients. A rate above 100% is impossible. Correct: ${A.delivery_rate}%.` },
  { id: "t3", label: "Open Rate", val: A.total_open_rate + "%", bad: true, why: `Total opens ÷ delivered counts repeat and machine opens. Correct: unique ${A.unique_open_rate}%, human ${A.human_open_rate}%.` },
  { id: "t4", label: "Click-to-Open Rate", val: A.ctor + "%", bad: false, why: "Correct: unique clicks ÷ unique opens." },
  { id: "t5", label: "Email ROI", val: A.roi + "%", bad: false, why: "Correct: (delivered attributed revenue − spend) ÷ spend." },
  { id: "t6", label: "Attributed Revenue", val: "₹" + N_(A.attr_rev_all_status), bad: true, why: `Includes cancelled and returned orders. Correct (Delivered only): ₹${N_(A.attr_rev)}.` },
  { id: "t7", label: "Website Sessions", val: N_(A.sessions), bad: false, why: "Correct: SUM(Sessions) over all rows." },
  { id: "t8", label: "Unique Visitors", val: N_(A.uv_sum), bad: true, why: "Daily unique visitors were summed, so one person visiting on 10 days counts 10 times. Unique counts are not additive: show it per day or as an average, never as a sum." },
  { id: "t9", label: "Bounce Rate", val: A.bounce_avg + "%", bad: true, why: `Simple average of row-level bounce %. A row with 10 sessions weighs the same as one with 10,000. Correct (weighted by sessions): ${A.bounce_weighted}%.` },
  { id: "t10", label: "WhatsApp Read Rate", val: (WA_.read_rate || 0) + "%", bad: false, why: "Correct: Read ÷ Delivered (where Delivered = Delivered + Read)." },
];
const BROKEN_CHART = { id: "c1", bad: true, why: `Share was counted as rows per source (every source has the same number of rows → 12.5% each). Correct: share of SESSIONS: ${(MD.src_sessions_pct || []).slice(0, 3).map(([k, v]) => `${k} ${v}%`).join(", ")}…` };
let brkFlags = new Set(), brkDone = false;
function renderBroken() {
  const root = document.getElementById("brk-root"); if (!root) return;
  const best = simState().brk.best;
  const tiles = BROKEN_TILES.map(t => { const f = brkFlags.has(t.id); const cls = brkDone ? (t.bad ? (f ? "hit" : "miss") : (f ? "false" : "okay")) : (f ? "flag" : ""); return `<button class="js-tile ${cls}" data-t="${t.id}"><span>${esc(t.label)}</span><b>${esc(t.val)}</b>${brkDone ? `<small>${t.bad ? (f ? "✅ You caught it" : "❌ Missed") : (f ? "⚠ This one was correct" : "✓ Correct")}</small>` : f ? "<small>🚩 Flagged</small>" : ""}</button>`; }).join("");
  const srcs = ["Organic Search", "Google Ads", "Direct", "Facebook", "Instagram", "Email", "Referral", "WhatsApp"];
  const cf = brkFlags.has("c1"); const ccls = brkDone ? (cf ? "hit" : "miss") : (cf ? "flag" : "");
  root.innerHTML = `<div class="card js-brief"><b>📩 From the Marketing Director:</b> “A junior analyst built this for tomorrow's leadership review. Something feels off. Flag every number you would NOT present, then submit.”${best != null ? `<span class="js-best ${best >= 70 ? "ok" : ""}">Your best: ${best}%</span>` : ""}</div>
    <div class="card js-dash"><div class="js-dash-h"><span>AXon · Email &amp; Web Performance · 2023–2024</span><small>click a tile or the chart to flag it</small></div>
      <div class="js-tiles">${tiles}</div>
      <button class="js-chart ${ccls}" data-t="c1"><div class="js-chart-h">Traffic share by source ${brkDone ? `<small>${cf ? "✅ You caught it" : "❌ Missed"}</small>` : cf ? "<small>🚩 Flagged</small>" : ""}</div>
        ${srcs.map(s => `<div class="js-cbar"><span>${s}</span><i><em style="width:${12.5 * 6}%"></em></i><b>12.5%</b></div>`).join("")}</button></div>
    <div class="js-actions">${brkDone ? `<button class="btn-outline" id="brk-reset">↺ Try again</button>` : `<button class="btn-blue" id="brk-submit">Submit review (${brkFlags.size} flagged)</button><button class="btn-outline" id="brk-clear">Clear flags</button>`}</div>
    <div id="brk-result"></div>`;
  root.querySelectorAll("[data-t]").forEach(b => b.addEventListener("click", () => { if (brkDone) return; const id = b.dataset.t; if (brkFlags.has(id)) brkFlags.delete(id); else brkFlags.add(id); renderBroken(); }));
  const sub = root.querySelector("#brk-submit"); if (sub) sub.addEventListener("click", () => {
    const all = BROKEN_TILES.concat([BROKEN_CHART]); const bad = all.filter(t => t.bad);
    const hits = bad.filter(t => brkFlags.has(t.id)).length, falses = all.filter(t => !t.bad && brkFlags.has(t.id)).length;
    const sc = Math.max(0, Math.round((hits - falses) / bad.length * 100));
    const s = simState(); const prev = s.brk || {}; s.brk = { best: Math.max(prev.best || 0, sc), last: sc, tries: (prev.tries || 0) + 1, ts: Date.now() }; simSave(s);
    brkDone = true; renderBroken();
    document.getElementById("brk-result").innerHTML = `<div class="card js-score"><div class="js-score-h"><span>Dashboard QA score</span><b>${sc}%</b></div>
      <p>You caught <b>${hits} of ${bad.length}</b> errors${falses ? ` and flagged <b>${falses}</b> correct number(s) by mistake (−1 each)` : ""}.</p>
      <ul class="js-why">${all.map(t => `<li class="${t.bad ? "bad" : "good"}"><b>${esc(t.label || "Traffic share by source")}</b> ${t.bad ? "✗" : "✓"} ${esc(t.why)}</li>`).join("")}</ul></div>`;
    renderSimSummary();
  });
  const cl = root.querySelector("#brk-clear"); if (cl) cl.addEventListener("click", () => { brkFlags.clear(); renderBroken(); });
  const rs = root.querySelector("#brk-reset"); if (rs) rs.addEventListener("click", () => { brkFlags.clear(); brkDone = false; renderBroken(); });
}

/* ============================================================
   3) STAKEHOLDER SIMULATOR
   ============================================================ */
const STK_CATS = [["obj", "Business objective"], ["metric", "Metric definition"], ["time", "Time period"], ["scope", "Audience & granularity"], ["rules", "Filters & attribution"]];
const STAKEHOLDERS = [
  { id: "s1", who: "Priya Menon · CMO", ask: "I need a dashboard to understand campaign performance.",
    qs: [
      ["What decision will this dashboard help you make?", "obj", 18, "Where to move next quarter's budget between channels and campaign types."],
      ["Who else will use it: you, the channel managers, or the board?", "scope", 14, "Me and the four channel managers. The board gets a one-page summary."],
      ["What does 'performance' mean for you: revenue, ROI, or engagement?", "metric", 18, "ROI first, then revenue. Engagement only as a diagnostic."],
      ["Which channels and campaigns are in scope?", "scope", 10, "All four: Email, Facebook, Instagram, WhatsApp. Exclude the 2 always-on campaigns from comparisons."],
      ["Which time period, and do you want a comparison?", "time", 16, "2024 vs 2023, by quarter."],
      ["Which revenue counts: all orders or only delivered ones?", "rules", 14, "Delivered only. Cancelled and returned orders aren't revenue."],
      ["Which attribution rule should we use?", "rules", 12, "Last click within 72 hours, same as the KPI document."],
      ["How often should it refresh?", "time", 6, "Weekly is enough."],
      ["Which colour theme do you like?", "bad", -8, "Whatever is readable. (A question for later, not for scoping.)"],
      ["Should I put every column on the dashboard?", "bad", -8, "No, only what supports the decision."],
      ["Can I use the Excel file instead of the database?", "bad", -6, "Use the database, so QA can reconcile."],
    ] },
  { id: "s2", who: "Neha Kapoor · Social Media Manager", ask: "Is Instagram working for us? I need an answer by Friday.",
    qs: [
      ["What would you do differently depending on the answer?", "obj", 18, "If it isn't paying back, I'll shift budget to Facebook retargeting."],
      ["Does 'working' mean engagement or sales?", "metric", 18, "Sales. I know engagement is high, but I need to justify spend."],
      ["Should I compare it with Facebook or with all channels?", "scope", 14, "Facebook first, then the channel view."],
      ["Do you want ROAS on revenue, or profit after product cost?", "metric", 12, "Both. Finance asks about profit."],
      ["Which period: last quarter, last year, or both years?", "time", 16, "Both years, so we see the trend."],
      ["Should Meta's own purchase numbers or our order data be used?", "rules", 14, "Use Meta-reported purchases for ads, but don't add them to the Orders total."],
      ["Should reach be summed across days?", "rules", 8, "No, reach isn't additive. Show impressions or average reach."],
      ["Should I break it down by ad format and city?", "scope", 6, "Ad format yes, city only if something stands out."],
      ["Can I add a word cloud of comments?", "bad", -8, "Not needed for this decision."],
      ["Should I build it in Excel, Tableau and Power BI?", "bad", -6, "One tool is enough for this question."],
      ["Do you want a 3D pie chart?", "bad", -8, "No."],
    ] },
  { id: "s3", who: "Arjun Nair · Finance Controller", ask: "Tell me the ROI of marketing.",
    qs: [
      ["Is this for a budget decision or for reporting?", "obj", 18, "Budget: we're deciding next year's marketing spend."],
      ["Which ROI formula: (revenue − spend) ÷ spend, or using gross margin?", "metric", 18, "Show both. Margin-based is what I'll use."],
      ["Which costs count: media spend only, or also message and production costs?", "metric", 12, "Media spend plus WhatsApp message costs."],
      ["Which channels: all, or Email and WhatsApp where we have order attribution?", "scope", 14, "All four, but label which revenue is platform-reported."],
      ["Calendar year or financial year?", "time", 16, "Calendar 2023 and 2024."],
      ["Should returned and cancelled orders be excluded?", "rules", 14, "Yes, delivered orders only."],
      ["Which attribution window should I use?", "rules", 10, "72-hour last click, as documented."],
      ["Do you need it per campaign or only per channel?", "scope", 8, "Per channel, with the 5 worst campaigns listed."],
      ["Can I round everything to crores?", "bad", -4, "Lakhs are clearer at this size."],
      ["Should I include website sessions in ROI?", "bad", -8, "Sessions aren't money. Keep them out."],
      ["Can I skip QA to deliver faster?", "bad", -10, "No. Finance numbers must reconcile."],
    ] },
];
let stkCur = null, stkSel = new Set(), stkDone = false;
const STK_MAX = 6;
function renderStakeholder() {
  const root = document.getElementById("stk-root"); if (!root) return;
  const st = simState();
  if (!stkCur) {
    root.innerHTML = `<div class="js-grid">${STAKEHOLDERS.map((x, i) => { const b = st.stk[x.id] ? st.stk[x.id].best : null; return `<button class="card js-case" data-stk="${x.id}">
      <div class="js-case-top"><span class="js-case-n">Request ${i + 1}</span>${b != null ? `<span class="js-best ${b >= 70 ? "ok" : ""}">Best ${b}%</span>` : ""}</div>
      <h4>💬 “${esc(x.ask)}”</h4><p>${esc(x.who)}</p><span class="js-open">${b != null ? "Retry" : "Clarify the request"} →</span></button>`; }).join("")}</div>`;
    root.querySelectorAll("[data-stk]").forEach(b => b.addEventListener("click", () => { stkCur = STAKEHOLDERS.find(x => x.id === b.dataset.stk); stkSel = new Set(); stkDone = false; renderStakeholder(); window.scrollTo({ top: 0 }); }));
    return;
  }
  const x = stkCur; const order = x.qs.map((q, i) => i).sort((a, b) => ((a * 7 + 3) % x.qs.length) - ((b * 7 + 3) % x.qs.length));
  root.innerHTML = `<button class="btn-outline js-back" id="stk-back">← All requests</button>
    <div class="card js-alert stk"><div class="js-alert-h"><span>💬 NEW REQUEST</span><small>${esc(x.who)}</small></div><div class="js-msg"><p class="js-big">“${esc(x.ask)}”</p></div></div>
    <h4 class="js-step">Before you build anything, pick up to ${STK_MAX} clarifying questions <small>(${stkSel.size}/${STK_MAX} chosen)</small></h4>
    <div class="js-opts">${order.map(i => { const q = x.qs[i]; const on = stkSel.has(i); const cls = stkDone ? (q[1] === "bad" ? (on ? "false" : "") : (on ? "hit" : "")) : ""; return `<label class="js-opt ${cls}"><input type="checkbox" data-q="${i}" ${on ? "checked" : ""} ${stkDone ? "disabled" : ""}> ${esc(q[0])}${stkDone && on ? `<span class="js-reply-a">↳ ${esc(q[3])}</span>` : ""}</label>`; }).join("")}</div>
    <div class="js-actions">${stkDone ? `<button class="btn-outline" id="stk-retry">↺ Try again</button>` : `<button class="btn-blue" id="stk-submit">Send questions</button>`}</div><div id="stk-result"></div>`;
  root.querySelector("#stk-back").addEventListener("click", () => { stkCur = null; renderStakeholder(); });
  root.querySelectorAll("[data-q]").forEach(c => c.addEventListener("change", () => { const i = +c.dataset.q; if (c.checked) { if (stkSel.size >= STK_MAX) { c.checked = false; return; } stkSel.add(i); } else stkSel.delete(i); renderStakeholder(); }));
  const rt = root.querySelector("#stk-retry"); if (rt) rt.addEventListener("click", () => { stkSel = new Set(); stkDone = false; renderStakeholder(); });
  const sb = root.querySelector("#stk-submit"); if (sb) sb.addEventListener("click", () => {
    if (stkSel.size < 3) { root.querySelector("#stk-result").innerHTML = `<div class="ed-msg bad">Ask at least 3 questions.</div>`; return; }
    stkDone = true; const sel = [...stkSel].map(i => x.qs[i]);
    const covered = STK_CATS.map(([c]) => sel.some(q => q[1] === c)); const bad = sel.filter(q => q[1] === "bad");
    const raw = sel.reduce((a, q) => a + q[2], 0); const bestPossible = x.qs.filter(q => q[2] > 0).map(q => q[2]).sort((a, b) => b - a).slice(0, STK_MAX).reduce((a, b) => a + b, 0);
    const sc = Math.max(0, Math.min(100, Math.round(raw / bestPossible * 70 + covered.filter(Boolean).length / STK_CATS.length * 30)));
    const s = simState(); const prev = s.stk[x.id] || {}; s.stk[x.id] = { best: Math.max(prev.best || 0, sc), last: sc, tries: (prev.tries || 0) + 1, ts: Date.now() }; simSave(s);
    renderStakeholder();
    const good = sel.filter(q => q[1] !== "bad");
    document.getElementById("stk-result").innerHTML = `<div class="card js-score"><div class="js-score-h"><span>Requirement quality</span><b>${sc}%</b></div>
      <div class="js-cov">${STK_CATS.map(([c, n], i) => `<span class="${covered[i] ? "ok" : "no"}">${covered[i] ? "✓" : "✗"} ${n}</span>`).join("")}</div>
      ${bad.length ? `<p>⚠ ${bad.length} question(s) didn't help scope the work: ${bad.map(q => `“${esc(q[0])}”`).join(", ")}.</p>` : `<p>✅ Every question you asked helped scope the work.</p>`}
      ${covered.some(v => !v) ? `<p>Missing: ${STK_CATS.filter((c, i) => !covered[i]).map(c => c[1]).join(", ")}. Without these you'd have to guess.</p>` : ""}
      <div class="js-tell"><b>📄 Your requirement brief (from the answers)</b><ul>${good.map(q => `<li><b>${esc(STK_CATS.find(c => c[0] === q[1])[1])}:</b> ${esc(q[3])}</li>`).join("")}</ul></div></div>`;
    renderSimSummary();
  });
}

/* ============================================================
   Summary strip on every simulator page + progress hook
   ============================================================ */
function simScores() {
  const s = simState(); const avg = (o, ids) => { const v = ids.map(i => o[i] && o[i].best).filter(x => x != null); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null; };
  return { inc: avg(s.inc, INCIDENTS.map(i => i.id)), incN: INCIDENTS.filter(i => s.inc[i.id]).length, brk: s.brk && s.brk.best != null ? s.brk.best : null, stk: avg(s.stk, STAKEHOLDERS.map(i => i.id)), stkN: STAKEHOLDERS.filter(i => s.stk[i.id]).length };
}
function renderSimSummary() {
  const sc = simScores();
  document.querySelectorAll(".js-summary").forEach(el => {
    el.innerHTML = [["🚨 Incident Room", sc.inc, `${sc.incN}/${INCIDENTS.length} solved`, "incident"], ["🧩 Broken Dashboard", sc.brk, sc.brk != null ? "best score" : "not tried", "broken"], ["💬 Stakeholder", sc.stk, `${sc.stkN}/${STAKEHOLDERS.length} done`, "stakeholder"]]
      .map(([t, v, sub, view]) => `<button class="js-sum" data-goto-sim="${view}"><span>${t}</span><b>${v != null ? v + "%" : "—"}</b><small>${sub}</small></button>`).join("");
    el.querySelectorAll("[data-goto-sim]").forEach(b => b.addEventListener("click", () => switchView(b.dataset.gotoSim)));
  });
}
function mergeObj(a, b) { let ch = false; for (const k in (b || {})) { if (!(k in a)) { a[k] = b[k]; ch = true; } else if (a[k] && typeof a[k] === "object" && b[k] && typeof b[k] === "object" && "ok" in b[k] && b[k].ok && !a[k].ok) { a[k] = b[k]; ch = true; } } return ch; }
window.HUB_PROGRESS = {
  collect() {
    const st = loadState(), ed = edState(), sc = simScores(), sim = simState();
    return { data: { state: st, solved: ed.solved || {}, sim }, summary: { pct: trackScores().overall, sql: Object.keys(ed.solved || {}).length, inc: sc.inc, brk: sc.brk, stk: sc.stk } };
  },
  apply(r) {
    if (!r) return false; let ch = false;
    const st = loadState(); Object.keys(r.state || {}).forEach(k => { if (!st[k] || typeof st[k] !== "object") { st[k] = r.state[k]; ch = true; } else if (mergeObj(st[k], r.state[k])) ch = true; });
    if (ch) saveState(st);
    const ed = edState(); let ech = false; Object.entries(r.solved || {}).forEach(([k, d]) => { if (!ed.solved[k]) { ed.solved[k] = d; ech = true; } }); if (ech) { edSave(ed); ch = true; }
    const sim = simState(); let sch = false;
    ["inc", "stk"].forEach(g => Object.entries((r.sim || {})[g] || {}).forEach(([k, v]) => { if (!sim[g][k] || (v.best || 0) > (sim[g][k].best || 0)) { sim[g][k] = v; sch = true; } }));
    if (r.sim && r.sim.brk && (r.sim.brk.best || 0) > ((sim.brk && sim.brk.best) || 0)) { sim.brk = r.sim.brk; sch = true; }
    if (sch) { lsSet(SIM_KEY, JSON.stringify(sim)); ch = true; }
    return ch;
  },
  reportHead() { return ["Progress", "SQL solved", "Incidents", "Broken DB", "Stakeholder"]; },
  reportCells(p) { const f = (v) => v == null ? "—" : v + "%"; return [f(p.pct), `${p.sql || 0}/${PRACTICE_PROBLEMS.length}`, f(p.inc), f(p.brk), f(p.stk)]; },
  welcome(profile) { simProfile = profile; renderContinueBanner(); },
};

/* Welcome back banner (uses the existing "continue" banner on Home) */
let simProfile = null;
const _origContinue = renderContinueBanner;
renderContinueBanner = function () {
  const wrap = document.getElementById("continue-banner"); if (!wrap) return;
  if (!simProfile || !simProfile.name) { _origContinue(); return; }
  const s = loadState(); const next = JOURNEY.find(j => !s.journey[j.id]); const pct = trackScores().overall;
  let last = null; try { last = JSON.parse(lsGet(LAST_VIEW_KEY)); } catch (e) {}
  const first = String(simProfile.name).split(" ")[0];
  wrap.style.display = "flex";
  wrap.innerHTML = `<span class="continue-text">👋 Welcome back, <strong>${esc(first)}</strong>. You're <strong>${pct}%</strong> through the capstone.${next ? ` Next step: <strong>${esc(next.t)}</strong>` : " All journey steps done 🎉"}</span>
    <div class="continue-actions">${next ? `<button type="button" class="continue-go" data-v="${next.go}">Continue project →</button>` : ""}${last && last.view && VIEW_LABELS[last.view] ? `<button type="button" class="continue-go alt" data-v="${last.view}">Back to ${esc(VIEW_LABELS[last.view])}</button>` : ""}<button type="button" class="continue-dismiss" title="Dismiss">✕</button></div>`;
  wrap.querySelectorAll(".continue-go").forEach(b => b.addEventListener("click", () => switchView(b.dataset.v)));
  wrap.querySelector(".continue-dismiss").addEventListener("click", () => { wrap.style.display = "none"; });
};

Object.assign(VIEW_LABELS, { incident: "Incident Room", broken: "Broken Dashboard Challenge", stakeholder: "Stakeholder Simulator" });
document.addEventListener("DOMContentLoaded", () => { renderIncidentRoom(); renderBroken(); renderStakeholder(); renderSimSummary(); });
