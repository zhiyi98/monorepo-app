'use client'

import {useEffect, useState} from 'react'
import {Button} from '@repo/core-ui-shadcn/components/ui/button'
import {Input} from '@repo/core-ui-shadcn/components/ui/input'
import {toast} from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/core-ui-shadcn/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/core-ui-shadcn/components/ui/dialog'
import {createClient} from "~/utils/supabase/component";

const styles = {
  container: 'max-w-6xl mx-auto p-6 space-y-6',
  header: 'flex justify-between items-center',
  table: 'rounded-lg border shadow-sm divide-y',
  dialog: 'sm:max-w-[600px]',
  inputGroup: 'space-y-4',
  loading: 'text-muted-foreground animate-pulse',
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    disabled: 'bg-muted text-muted-foreground cursor-not-allowed'
  },
  tableRow: 'hover:bg-accent/50 transition-colors'
}

type Book = {
  id: string
  title: string
  author: string
  isbn: string
  published_year: number
  created_at: string
}

export default function BooksPage() {
  const supabase = createClient()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)

  // 初始化表单数据
  const initialFormData = {
    title: '',
    author: '',
    isbn: '',
    published_year: new Date().getFullYear()
  }
  const [addFormData, setAddFormData] = useState(initialFormData)
  const [editFormData, setEditFormData] = useState(initialFormData)

  // 数据加载
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const {data, error} = await supabase
          .from('books')
          .select('*')
          .order('created_at', {ascending: false})

        if (error) throw error
        setBooks(data || [])
      } catch (error) {
        toast("加载失败")
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  // 新增提交
  const handleAddSubmit = async () => {
    if (!addFormData.title || !addFormData.author) {
      return toast("请填写必填字段")
    }

    setSubmitting(true)
    try {
      const {data, error} = await supabase
        .from('books')
        .insert([addFormData])
        .select()
        .single()

      if (error) throw error
      setBooks([data, ...books])
      toast("新增成功")
      setOpenAddDialog(false)
      setAddFormData(initialFormData)
    } catch (error) {
      toast("新增失败")
    } finally {
      setSubmitting(false)
    }
  }

  // 编辑提交
  const handleEditSubmit = async () => {
    if (!currentBook?.id || !editFormData.title || !editFormData.author) {
      return toast("请填写必填字段")
    }

    setSubmitting(true)
    try {
      const {error} = await supabase
        .from('books')
        .update(editFormData)
        .eq('id', currentBook.id)

      if (error) throw error
      setBooks(books.map(b => b.id === currentBook.id ? {...b, ...editFormData} : b))
      toast("更新成功")
      setOpenEditDialog(false)
    } catch (error) {
      toast("更新失败")
    } finally {
      setSubmitting(false)
    }
  }

  // 删除处理
  const handleDelete = async (id: string) => {
    try {
      const {error} = await supabase
        .from('books')
        .delete()
        .eq('id', id)

      if (error) throw error
      setBooks(books.filter(book => book.id !== id))
      toast("删除成功")
    } catch (error) {
      toast("删除失败")
    }
  }

  // 打开编辑对话框
  const openEdit = (book: Book) => {
    setCurrentBook(book)
    setEditFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      published_year: book.published_year
    })
    setOpenEditDialog(true)
  }

  return (
    <div className={styles.container}>
      {/* 头部操作栏 */}
      <div className={styles.header}>
        <h1 className="text-3xl font-bold">图书管理</h1>
        <Button
          className={styles.button.primary}
          onClick={() => setOpenAddDialog(true)}
        >
          新增图书
        </Button>
      </div>

      {/* 数据表格 */}
      <div className={styles.table}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>书名</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>ISBN</TableHead>
              <TableHead>出版年份</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <span className={styles.loading}>加载中...</span>
                </TableCell>
              </TableRow>
            ) : books.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              books.map((book) => (
                <TableRow key={book.id} className={styles.tableRow}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.isbn}</TableCell>
                  <TableCell>{book.published_year}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(book)}
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(book.id)}
                    >
                      删除
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 新增对话框 */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className={styles.dialog}>
          <DialogHeader>
            <DialogTitle>新增图书</DialogTitle>
          </DialogHeader>

          <div className={styles.inputGroup}>
            <Input
              placeholder="书名 *"
              value={addFormData.title}
              onChange={(e) => setAddFormData({...addFormData, title: e.target.value})}
            />
            <Input
              placeholder="作者 *"
              value={addFormData.author}
              onChange={(e) => setAddFormData({...addFormData, author: e.target.value})}
            />
            <Input
              placeholder="ISBN"
              value={addFormData.isbn}
              onChange={(e) => setAddFormData({...addFormData, isbn: e.target.value})}
            />
            <Input
              type="number"
              placeholder="出版年份"
              value={addFormData.published_year}
              onChange={(e) => setAddFormData({
                ...addFormData,
                published_year: Number(e.target.value) || new Date().getFullYear()
              })}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenAddDialog(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              className={submitting ? styles.button.disabled : styles.button.primary}
              onClick={handleAddSubmit}
              disabled={submitting}
            >
              {submitting ? '提交中...' : '创建图书'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className={styles.dialog}>
          <DialogHeader>
            <DialogTitle>编辑图书</DialogTitle>
          </DialogHeader>

          <div className={styles.inputGroup}>
            <Input
              placeholder="书名 *"
              value={editFormData.title}
              onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
            />
            <Input
              placeholder="作者 *"
              value={editFormData.author}
              onChange={(e) => setEditFormData({...editFormData, author: e.target.value})}
            />
            <Input
              placeholder="ISBN"
              value={editFormData.isbn}
              onChange={(e) => setEditFormData({...editFormData, isbn: e.target.value})}
            />
            <Input
              type="number"
              placeholder="出版年份"
              value={editFormData.published_year}
              onChange={(e) => setEditFormData({
                ...editFormData,
                published_year: Number(e.target.value) || new Date().getFullYear()
              })}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenEditDialog(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              className={submitting ? styles.button.disabled : styles.button.primary}
              onClick={handleEditSubmit}
              disabled={submitting}
            >
              {submitting ? '更新中...' : '保存修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}