import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import '../../core/state/auth_state.dart';
import '../../shared/components/module_popup_shell.dart';

// ─── Design tokens ────────────────────────────────────────────────────────────
const _bg      = Color(0xFFF0F6FF);
const _ink     = Color(0xFF1E1B4B);
const _sub     = Color(0xFF6B7280);
const _overdue = Color(0xFFDC2626);
const _soon    = Color(0xFFD97706);
const _ok      = Color(0xFF059669);
const _indigo  = Color(0xFF6366F1);
const _grad = LinearGradient(
  colors: [Color(0xFF6366F1), Color(0xFF818CF8)],
  begin: Alignment.topLeft, end: Alignment.bottomRight,
);

// ─── Models ───────────────────────────────────────────────────────────────────
class _Book {
  final String id, title, author;
  final String? isbn, category, shelfNo, coverUrl;
  _Book({required this.id, required this.title, required this.author, this.isbn, this.category, this.shelfNo, this.coverUrl});
  factory _Book.fromJson(Map j) => _Book(
    id: j['id'] ?? '', title: j['title'] ?? '', author: j['author'] ?? '',
    isbn: j['isbn'], category: j['category'], shelfNo: j['shelfNo'], coverUrl: j['coverUrl'],
  );
}

class _Classroom {
  final String id, name;
  final String? grade;
  _Classroom({required this.id, required this.name, this.grade});
  factory _Classroom.fromJson(Map j) => _Classroom(id: j['id'] ?? '', name: j['name'] ?? '', grade: j['grade']);
}

class _Student {
  final String id, firstName, lastName;
  final String? admissionNumber;
  final _Classroom? classroom;
  _Student({required this.id, required this.firstName, required this.lastName, this.admissionNumber, this.classroom});
  factory _Student.fromJson(Map j) => _Student(
    id: j['id'] ?? '', firstName: j['firstName'] ?? '', lastName: j['lastName'] ?? '',
    admissionNumber: j['admissionNumber'],
    classroom: j['classroom'] != null ? _Classroom.fromJson(j['classroom']) : null,
  );
  String get fullName => '$firstName $lastName';
}

class _Transaction {
  final String id, status;
  final DateTime issuedDate, dueDate;
  final DateTime? returnedDate;
  final double fineAmount;
  final _Book book;
  final _Student? student;

  _Transaction({required this.id, required this.status, required this.issuedDate, required this.dueDate,
    this.returnedDate, required this.fineAmount, required this.book, this.student});

  factory _Transaction.fromJson(Map j) => _Transaction(
    id: j['id'] ?? '',
    status: j['status'] ?? 'ISSUED',
    issuedDate: DateTime.tryParse(j['issuedDate'] ?? '') ?? DateTime.now(),
    dueDate: DateTime.tryParse(j['dueDate'] ?? '') ?? DateTime.now(),
    returnedDate: j['returnedDate'] != null ? DateTime.tryParse(j['returnedDate']) : null,
    fineAmount: (j['fineAmount'] as num?)?.toDouble() ?? 0.0,
    book: _Book.fromJson(j['book'] ?? {}),
    student: j['student'] != null ? _Student.fromJson(j['student']) : null,
  );

  bool get isOverdue => status == 'ISSUED' && dueDate.isBefore(DateTime.now());
  bool get isDueSoon {
    if (status != 'ISSUED' || isOverdue) return false;
    return dueDate.isBefore(DateTime.now().add(const Duration(days: 3)));
  }
  int get overdueDays => isOverdue ? DateTime.now().difference(dueDate).inDays : 0;
  double get estimatedFine => isOverdue ? overdueDays * 10.0 : 0.0;
}

class _LibraryData {
  final List<_Transaction> transactions;
  final int totalIssued, overdueCount, dueSoonCount;
  final double finePerDay;
  _LibraryData({required this.transactions, required this.totalIssued, required this.overdueCount,
    required this.dueSoonCount, required this.finePerDay});
}

// ─── Filter Enum ─────────────────────────────────────────────────────────────
enum _Filter { all, overdue, dueSoon, returned }

// ─── Provider ────────────────────────────────────────────────────────────────
final _filterProvider = StateProvider<_Filter>((ref) => _Filter.all);

final libraryDataProvider = FutureProvider.autoDispose.family<_LibraryData, String>((ref, filter) async {
  final user = ref.watch(userProfileProvider);
  if (user?.token == null) throw Exception('Not logged in');

  final filterParam = switch(filter) {
    'overdue' => 'overdue',
    'due_soon' => 'due_soon',
    'returned' => 'returned',
    _ => 'all',
  };

  final res = await http.get(
    Uri.parse('http://localhost:3000/api/mobile/v1/staff/library?filter=$filterParam'),
    headers: {'Authorization': 'Bearer ${user!.token}'},
  ).timeout(const Duration(seconds: 15));

  if (res.statusCode != 200) throw Exception('Failed to load library data');
  final body = jsonDecode(res.body);
  if (!(body['success'] as bool)) throw Exception(body['error'] ?? 'Error');

  final d = body['data'] as Map;
  final stats = d['stats'] as Map;
  final txList = (d['transactions'] as List)
      .map((t) => _Transaction.fromJson(t as Map))
      .toList();

  return _LibraryData(
    transactions: txList,
    totalIssued: (stats['totalIssued'] as num?)?.toInt() ?? 0,
    overdueCount: (stats['overdueCount'] as num?)?.toInt() ?? 0,
    dueSoonCount: (stats['dueSoonCount'] as num?)?.toInt() ?? 0,
    finePerDay: (stats['finePerDay'] as num?)?.toDouble() ?? 10.0,
  );
});

// ─── Main view ───────────────────────────────────────────────────────────────
class StaffLibraryView extends ConsumerStatefulWidget {
  const StaffLibraryView({super.key});
  @override
  ConsumerState<StaffLibraryView> createState() => _StaffLibraryViewState();
}

class _StaffLibraryViewState extends ConsumerState<StaffLibraryView> {
  String _search = '';
  _Transaction? _selected;

  String _filterKey(_Filter f) => switch(f) {
    _Filter.overdue => 'overdue',
    _Filter.dueSoon => 'due_soon',
    _Filter.returned => 'returned',
    _Filter.all => 'all',
  };

  @override
  Widget build(BuildContext context) {
    if (_selected != null) {
      return _TransactionDetail(
        tx: _selected!,
        onBack: () => setState(() => _selected = null),
      );
    }

    final filter = ref.watch(_filterProvider);
    final dataAsync = ref.watch(libraryDataProvider(_filterKey(filter)));

    return ModulePopupShell(
      title: 'Library',
      icon: Icons.local_library_rounded,
      backgroundColor: _bg,
      body: dataAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: _indigo)),
        error: (e, _) => _ErrorView(onRetry: () => ref.invalidate(libraryDataProvider)),
        data: (data) => _buildContent(data, filter),
      ),
    );
  }

  Widget _buildContent(_LibraryData data, _Filter filter) {
    // Filter + search
    var txs = data.transactions.where((tx) {
      if (_search.isEmpty) return true;
      final q = _search.toLowerCase();
      return (tx.student?.fullName.toLowerCase().contains(q) ?? false) ||
        tx.book.title.toLowerCase().contains(q) ||
        tx.book.author.toLowerCase().contains(q) ||
        (tx.student?.classroom?.name.toLowerCase().contains(q) ?? false) ||
        (tx.student?.admissionNumber?.toLowerCase().contains(q) ?? false);
    }).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

        // ── Stats row ─────────────────────────────────────────────────────
        Row(children: [
          _statCard(data.totalIssued.toString(), 'Issued', _indigo, Icons.book_rounded),
          const SizedBox(width: 10),
          _statCard(data.overdueCount.toString(), 'Overdue', _overdue, Icons.warning_amber_rounded),
          const SizedBox(width: 10),
          _statCard(data.dueSoonCount.toString(), 'Due Soon', _soon, Icons.schedule_rounded),
        ]),
        const SizedBox(height: 14),

        // ── Filter chips ──────────────────────────────────────────────────
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(children: [
            _filterChip('All', _Filter.all, filter, Icons.list_alt_rounded),
            const SizedBox(width: 8),
            _filterChip('Overdue', _Filter.overdue, filter, Icons.warning_amber_rounded, badgeColor: _overdue, badge: data.overdueCount),
            const SizedBox(width: 8),
            _filterChip('Due Soon', _Filter.dueSoon, filter, Icons.schedule_rounded, badgeColor: _soon, badge: data.dueSoonCount),
            const SizedBox(width: 8),
            _filterChip('Returned', _Filter.returned, filter, Icons.check_circle_rounded),
          ]),
        ),
        const SizedBox(height: 14),

        // ── Search ────────────────────────────────────────────────────────
        Container(
          height: 44,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: Row(children: [
            const SizedBox(width: 12),
            const Icon(Icons.search_rounded, size: 18, color: Color(0xFF9CA3AF)),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                onChanged: (v) => setState(() => _search = v),
                style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w600),
                decoration: const InputDecoration(
                  hintText: 'Search student, book, class…',
                  hintStyle: TextStyle(fontFamily: 'Satoshi', fontSize: 13, color: Color(0xFF9CA3AF)),
                  border: InputBorder.none, isDense: true,
                ),
              ),
            ),
          ]),
        ),
        const SizedBox(height: 14),

        // ── Transaction list ──────────────────────────────────────────────
        if (txs.isEmpty)
          _emptyState(filter)
        else ...[
          Text('${txs.length} record${txs.length != 1 ? 's' : ''}',
            style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF9CA3AF))),
          const SizedBox(height: 8),
          ...txs.map((tx) => _TxCard(tx: tx, onTap: () => setState(() => _selected = tx))),
        ],
      ]),
    );
  }

  Widget _statCard(String value, String label, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.2)),
          boxShadow: [BoxShadow(color: color.withOpacity(0.08), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Column(children: [
          Container(
            width: 32, height: 32,
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(9)),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w900, fontSize: 20, color: color)),
          Text(label, style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 9, color: Color(0xFF9CA3AF))),
        ]),
      ),
    );
  }

  Widget _filterChip(String label, _Filter f, _Filter current, IconData icon, {Color? badgeColor, int? badge}) {
    final active = f == current;
    return GestureDetector(
      onTap: () => ref.read(_filterProvider.notifier).state = f,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          gradient: active ? _grad : null,
          color: active ? null : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: active ? Colors.transparent : const Color(0xFFE5E7EB)),
          boxShadow: active ? [BoxShadow(color: _indigo.withOpacity(0.25), blurRadius: 8, offset: const Offset(0, 2))] : null,
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, size: 13, color: active ? Colors.white : _sub),
          const SizedBox(width: 5),
          Text(label, style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800, fontSize: 11, color: active ? Colors.white : _sub)),
          if (badge != null && badge > 0) ...[
            const SizedBox(width: 5),
            Container(
              width: 18, height: 18,
              decoration: BoxDecoration(color: active ? Colors.white.withOpacity(0.3) : (badgeColor ?? _indigo), shape: BoxShape.circle),
              child: Center(child: Text('$badge', style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w900, fontSize: 9, color: active ? Colors.white : Colors.white))),
            ),
          ],
        ]),
      ),
    );
  }

  Widget _emptyState(_Filter filter) {
    final msg = switch(filter) {
      _Filter.overdue => 'No overdue books! 🎉',
      _Filter.dueSoon => 'No books due in the next 3 days',
      _Filter.returned => 'No returned books yet',
      _Filter.all => 'No books currently issued',
    };
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Icon(Icons.library_books_rounded, size: 48, color: _indigo.withOpacity(0.3)),
          const SizedBox(height: 12),
          Text(msg, style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 14, color: Color(0xFF9CA3AF))),
        ]),
      ),
    );
  }
}

// ─── Transaction card ─────────────────────────────────────────────────────────
class _TxCard extends StatelessWidget {
  final _Transaction tx;
  final VoidCallback onTap;
  const _TxCard({required this.tx, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final Color accent = tx.isOverdue ? _overdue : tx.isDueSoon ? _soon : _ok;
    final String dueLine = tx.isOverdue
        ? '${tx.overdueDays}d overdue · ₹${tx.estimatedFine.toStringAsFixed(0)} fine'
        : tx.status == 'RETURNED'
          ? 'Returned ${_fmt(tx.returnedDate ?? tx.issuedDate)}'
          : 'Due ${_fmt(tx.dueDate)}';

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: accent.withOpacity(0.2)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
        ),
        child: Row(children: [
          // Book icon / cover
          Container(
            width: 44, height: 58,
            decoration: BoxDecoration(
              color: accent.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: tx.book.coverUrl != null
              ? ClipRRect(borderRadius: BorderRadius.circular(10), child: Image.network(tx.book.coverUrl!, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Icon(Icons.book_rounded, color: accent, size: 22)))
              : Icon(Icons.book_rounded, color: accent, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              // Book title
              Text(tx.book.title,
                style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w800, fontSize: 13, color: _ink),
                maxLines: 1, overflow: TextOverflow.ellipsis),
              Text(tx.book.author,
                style: const TextStyle(fontFamily: 'Satoshi', fontSize: 11, color: _sub),
                maxLines: 1, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 6),
              // Student
              if (tx.student != null)
                Row(children: [
                  Icon(Icons.person_rounded, size: 12, color: _indigo),
                  const SizedBox(width: 3),
                  Expanded(
                    child: Text(
                      '${tx.student!.fullName}${tx.student?.classroom != null ? ' · ${tx.student!.classroom!.name}' : ''}',
                      style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 11, color: _indigo),
                      maxLines: 1, overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ]),
              const SizedBox(height: 4),
              // Due / overdue line
              Row(children: [
                Icon(tx.isOverdue ? Icons.warning_amber_rounded : Icons.schedule_rounded, size: 12, color: accent),
                const SizedBox(width: 3),
                Text(dueLine, style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 11, color: accent)),
              ]),
            ]),
          ),
          // Status badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(color: accent.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
            child: Text(
              tx.isOverdue ? 'OVERDUE' : tx.isDueSoon ? 'DUE SOON' : tx.status,
              style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w900, fontSize: 8, color: accent),
            ),
          ),
          const SizedBox(width: 4),
          Icon(Icons.chevron_right_rounded, size: 16, color: Colors.grey.shade300),
        ]),
      ),
    );
  }

  static String _fmt(DateTime d) {
    final months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${d.day} ${months[d.month]}';
  }
}

// ─── Transaction detail panel ─────────────────────────────────────────────────
class _TransactionDetail extends StatelessWidget {
  final _Transaction tx;
  final VoidCallback onBack;
  const _TransactionDetail({required this.tx, required this.onBack});

  static String _fmt(DateTime d) {
    final months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return '${d.day} ${months[d.month]} ${d.year}';
  }

  @override
  Widget build(BuildContext context) {
    final Color accent = tx.isOverdue ? _overdue : tx.isDueSoon ? _soon : _ok;

    return ModulePopupShell(
      title: 'Transaction Detail',
      icon: Icons.receipt_long_rounded,
      backgroundColor: _bg,
      actionIcon: Icons.arrow_back_rounded,
      onActionIcon: onBack,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

          // ── Book card ─────────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF1E1B4B), Color(0xFF312E81)], begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Row(children: [
              Container(
                width: 54, height: 72,
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                child: tx.book.coverUrl != null
                  ? ClipRRect(borderRadius: BorderRadius.circular(10), child: Image.network(tx.book.coverUrl!, fit: BoxFit.cover, errorBuilder: (_,__,___) => const Icon(Icons.book_rounded, color: Colors.white, size: 28)))
                  : const Icon(Icons.book_rounded, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(tx.book.title, style: const TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w900, fontSize: 16, color: Colors.white), maxLines: 2),
                const SizedBox(height: 4),
                Text(tx.book.author, style: TextStyle(fontFamily: 'Satoshi', fontSize: 12, color: Colors.white.withOpacity(0.65))),
                if (tx.book.category != null) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(6)),
                    child: Text(tx.book.category!, style: const TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, fontSize: 10, color: Colors.white)),
                  ),
                ],
              ])),
            ]),
          ),
          const SizedBox(height: 16),

          // ── Status banner ─────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: accent.withOpacity(0.08),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: accent.withOpacity(0.25)),
            ),
            child: Row(children: [
              Icon(tx.isOverdue ? Icons.warning_amber_rounded : tx.isDueSoon ? Icons.schedule_rounded : Icons.check_circle_rounded, color: accent, size: 22),
              const SizedBox(width: 12),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(
                  tx.isOverdue ? '${tx.overdueDays} Days Overdue' : tx.isDueSoon ? 'Due in ${tx.dueDate.difference(DateTime.now()).inDays} days' : tx.status == 'RETURNED' ? 'Returned' : 'On Time',
                  style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w900, fontSize: 14, color: accent),
                ),
                if (tx.isOverdue)
                  Text('Estimated fine: ₹${tx.estimatedFine.toStringAsFixed(0)}', style: TextStyle(fontFamily: 'Satoshi', fontSize: 11, color: accent.withOpacity(0.8))),
              ])),
            ]),
          ),
          const SizedBox(height: 14),

          // ── Info rows ─────────────────────────────────────────────────
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFE5E7EB))),
            child: Column(children: [
              if (tx.student != null) ...[
                _infoRow('Student', tx.student!.fullName, Icons.person_rounded, _indigo),
                const Divider(height: 16, color: Color(0xFFF3F4F6)),
                if (tx.student!.classroom != null)
                  _infoRow('Class', tx.student!.classroom!.name, Icons.class_rounded, _indigo),
                if (tx.student?.admissionNumber != null)
                  _infoRow('Admission No.', tx.student!.admissionNumber!, Icons.numbers_rounded, _sub),
                const Divider(height: 16, color: Color(0xFFF3F4F6)),
              ],
              _infoRow('Issue Date', _fmt(tx.issuedDate), Icons.calendar_today_rounded, _ok),
              const Divider(height: 16, color: Color(0xFFF3F4F6)),
              _infoRow('Due Date', _fmt(tx.dueDate), Icons.event_rounded, accent),
              if (tx.returnedDate != null) ...[
                const Divider(height: 16, color: Color(0xFFF3F4F6)),
                _infoRow('Returned On', _fmt(tx.returnedDate!), Icons.assignment_return_rounded, _ok),
              ],
              if (tx.fineAmount > 0) ...[
                const Divider(height: 16, color: Color(0xFFF3F4F6)),
                _infoRow('Fine Paid', '₹${tx.fineAmount.toStringAsFixed(0)}', Icons.currency_rupee_rounded, _overdue),
              ],
              if (tx.book.shelfNo != null) ...[const Divider(height: 16, color: Color(0xFFF3F4F6)),
                _infoRow('Shelf No.', tx.book.shelfNo!, Icons.shelves, _sub),
              ],
            ]),
          ),
          const SizedBox(height: 14),

          // ── Book details ──────────────────────────────────────────────
          if (tx.book.isbn != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFE5E7EB))),
              child: _infoRow('ISBN', tx.book.isbn!, Icons.qr_code_rounded, _sub),
            ),
        ]),
      ),
    );
  }

  Widget _infoRow(String label, String value, IconData icon, Color color) {
    return Row(children: [
      Container(width: 30, height: 30, decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, size: 14, color: color)),
      const SizedBox(width: 10),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF9CA3AF))),
        Text(value, style: const TextStyle(fontFamily: 'Satoshi', fontSize: 13, fontWeight: FontWeight.w700, color: _ink)),
      ])),
    ]);
  }
}

// ─── Error view ───────────────────────────────────────────────────────────────
class _ErrorView extends StatelessWidget {
  final VoidCallback onRetry;
  const _ErrorView({required this.onRetry});
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        const Icon(Icons.error_outline_rounded, color: _overdue, size: 44),
        const SizedBox(height: 12),
        const Text('Failed to load library data', style: TextStyle(fontFamily: 'Satoshi', fontWeight: FontWeight.w700, color: _sub)),
        const SizedBox(height: 12),
        TextButton(onPressed: onRetry, child: const Text('Retry', style: TextStyle(color: _indigo, fontWeight: FontWeight.w800))),
      ]),
    );
  }
}
