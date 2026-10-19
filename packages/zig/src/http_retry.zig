//! Retry-After parsing for safe GETs. A delay larger than the existing archive
//! request budget is not shortened into an early retry: the caller stops.
const std = @import("std");

pub const max_delay_seconds: u64 = 300;

pub fn retryAfterSeconds(value: []const u8, now_seconds: i64) ?u64 {
    const text = std.mem.trim(u8, value, " \t");
    if (text.len == 0) return null;
    if (std.ascii.isDigit(text[0])) {
        for (text) |character| if (!std.ascii.isDigit(character)) return null;
        // Overflow is an excessive server delay, not permission to retry early.
        return std.fmt.parseInt(u64, text, 10) catch std.math.maxInt(u64);
    }
    const timestamp = httpDateSeconds(text) orelse return null;
    if (timestamp <= now_seconds) return 0;
    return @intCast(timestamp - now_seconds);
}

fn httpDateSeconds(text: []const u8) ?i64 {
    if (text.len != 29 or !std.mem.eql(u8, text[3..5], ", ") or text[7] != ' ' or text[11] != ' ' or text[16] != ' ' or text[19] != ':' or text[22] != ':' or !std.mem.eql(u8, text[25..], " GMT")) return null;
    const weekdays = [_][]const u8{ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" };
    var weekday_valid = false;
    for (weekdays) |weekday| if (std.mem.eql(u8, text[0..3], weekday)) {
        weekday_valid = true;
        break;
    };
    if (!weekday_valid) return null;
    const months = [_][]const u8{ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
    const month: usize = for (months, 0..) |name, index| {
        if (std.mem.eql(u8, text[8..11], name)) break index;
    } else return null;
    const year = std.fmt.parseInt(u16, text[12..16], 10) catch return null;
    const day = std.fmt.parseInt(u8, text[5..7], 10) catch return null;
    const hour = std.fmt.parseInt(u8, text[17..19], 10) catch return null;
    const minute = std.fmt.parseInt(u8, text[20..22], 10) catch return null;
    const second = std.fmt.parseInt(u8, text[23..25], 10) catch return null;
    if (year < 1970 or hour > 23 or minute > 59 or second > 59) return null;
    const lengths = [_]u8{ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
    const month_days = lengths[month] + @as(u8, if (month == 1 and leap(year)) 1 else 0);
    if (day < 1 or day > month_days) return null;
    var days: i64 = 0;
    var prior: u16 = 1970;
    while (prior < year) : (prior += 1) days += if (leap(prior)) @as(i64, 366) else 365;
    for (0..month) |index| days += lengths[index] + @as(u8, if (index == 1 and leap(year)) 1 else 0);
    days += day - 1;
    return days * 86400 + @as(i64, hour) * 3600 + @as(i64, minute) * 60 + second;
}

fn leap(year: u16) bool {
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0);
}

test "Retry-After supports delta seconds and IMF-fixdate without early retry" {
    const expect = std.testing.expectEqual;
    try expect(@as(?u64, 60), retryAfterSeconds(" 60 ", 0));
    try expect(@as(?u64, 0), retryAfterSeconds("0", 0));
    try expect(@as(?u64, 60), retryAfterSeconds("Thu, 01 Jan 1970 00:01:00 GMT", 0));
    try expect(@as(?u64, 0), retryAfterSeconds("Thu, 01 Jan 1970 00:01:00 GMT", 120));
    try expect(@as(?u64, 86400), retryAfterSeconds("Fri, 02 Jan 1970 00:00:00 GMT", 0));
    try expect(@as(?u64, 951782400), retryAfterSeconds("Tue, 29 Feb 2000 00:00:00 GMT", 0));
    try expect(@as(?u64, null), retryAfterSeconds("Mon, 29 Feb 2100 00:00:00 GMT", 0));
    try expect(@as(?u64, null), retryAfterSeconds("-1", 0));
    try expect(@as(?u64, null), retryAfterSeconds("1.5", 0));
    try expect(@as(?u64, null), retryAfterSeconds("not a date", 0));
    try expect(@as(?u64, std.math.maxInt(u64)), retryAfterSeconds("9999999999999999999999999", 0));
}
